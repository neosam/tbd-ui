#[macro_use] extern crate nickel;
//#[macro_use] extern crate json;
extern crate rustc_serialize;
extern crate tbd;
extern crate time;
extern crate rand;

use nickel::{Nickel, HttpRouter, JsonBody};
use nickel::StaticFilesHandler;
use rustc_serialize::json;
use tbd::{task, tasklog};
use tbd::task::{ActiveTask, PooledTask, TaskStatTrait};
use tbd::tasklog::{TaskLog, TaskLogEntry, TaskAction};
use tbd::iolog::IOLog;
use tbd::log::{Log, LogIteratorHash};
use std::sync::{Arc, Mutex};
use time::{Tm, Duration};
use rand::StdRng;
use tbd::hash::Hash;

fn get_active_tasks<T: TaskStatTrait>(task_stat: &T) -> String {
    let active_tasks = task_stat.all_actives().unwrap_or(Vec::<ActiveTask>::new());
    let mut res = Vec::new();

    let now = time::now();

    for a_task in active_tasks {
        let diff = a_task.due - now;

        res.push(SendActiveTask {
            title: a_task.task.title,
            due_date: diff.num_days() as i16
        });
    };
    json::encode(&res).unwrap()
}

fn buildLog(task_log: &IOLog<TaskLogEntry>) -> String {
    let iter = LogIteratorHash::from_log(task_log);
    let mut res = Vec::<LogReply>::new();
    let mut i = 0;
    for hash in iter {
        let entry = task_log.get(hash).unwrap();
        print!("Process {:?}\n", entry);
        let timestamp = entry.timestamp.to_timespec().sec;
        res.push(match entry.action {
            TaskAction::ScheduleTask(ref a_task) => LogReply {
                hash: hash.as_string(),
                action: "schedule".to_string(),
                details: vec![format!("{}", a_task.task.title)],
                timestamp: timestamp
            },
            TaskAction::PoolTask(ref p_task) => LogReply {
                hash: hash.as_string(),
                action: "pooled".to_string(),
                details: vec![format!("{}", p_task.task.title)],
                timestamp: timestamp
            },
            TaskAction::CompleteTask(ref a_task) => LogReply {
                hash: hash.as_string(),
                action: "complete".to_string(),
                details: vec![format!("{}", a_task.task.title)],
                timestamp: timestamp
            },
            TaskAction::ActivateTask(ref a_tasks) => LogReply {
                hash: hash.as_string(),
                action: "activate".to_string(),
                details: {
                    let mut res = Vec::new();
                    for a_task in a_tasks {
                        res.push(a_task.clone().task.title);
                    }
                    res
                },
                timestamp: timestamp
            }
        });
        i += 1;
        if i > 100 {
            break;
        }
    }
    json::encode(&res).unwrap()
}

fn get_pooled_tasks<T: TaskStatTrait>(task_stat: &T) -> String {
    let pooled_tasks = task_stat.all_pooled().unwrap_or(Vec::<PooledTask>::new());
    let mut res = Vec::new();

    let now = time::now();

    for p_task in pooled_tasks {
        let diff = p_task.cooling_until - now;
        res.push(SendPooledTask{
            title: p_task.task.title,
            due_days: p_task.due_days,
            propability: p_task.propability,
            cool_down: p_task.cool_down,
            cooling_until: diff.num_days() as i16
        })
    };
    json::encode(&res).unwrap()
}

#[derive(RustcDecodable, RustcEncodable)]
struct LogReply {
    hash: String,
    action: String,
    details: Vec<String>,
    timestamp: i64
}


#[derive(RustcDecodable, RustcEncodable)]
struct NewActiveTask {
    title: String,
    description: String,
    factor: f32,
    due_until: i16
}

#[derive(RustcDecodable, RustcEncodable)]
struct NewPooledTask {
    title: String,
    description: String,
    factor: f32,
    propability: f32,
    cool_down: i16,
    due_days: i16
}

#[derive(Clone, RustcDecodable, RustcEncodable)]
struct SendActiveTask {
    title: String,
    due_date: i16
}

#[derive(Clone, RustcDecodable, RustcEncodable)]
struct SendPooledTask {
    title: String,
    due_days: i16,
    propability: f32,
    cool_down: i16,
    cooling_until: i16
}

#[derive(Clone, RustcDecodable, RustcEncodable)]
struct TitleOnly {
    title: String
}

fn main() {
    let mut server = Nickel::new();
    let mut tasklog = TaskLog::new(".tbd".to_string());
    tasklog.load_head();
    let tasklog_active_tasks = Arc::new(Mutex::new(tasklog));
    let tasklog_add_active = tasklog_active_tasks.clone();
    let tasklog_pooled_tasks = tasklog_active_tasks.clone();
    let tasklog_add_pooled = tasklog_active_tasks.clone();
    let tasklog_pick_actives = tasklog_active_tasks.clone();
    let tasklog_finish = tasklog_active_tasks.clone();
    let tasklog_log = tasklog_active_tasks.clone();
    let tasklog_revert = tasklog_active_tasks.clone();

    server.get("/hello", middleware!("Hello World"));
    server.get("/hello2", middleware!("Hello World2"));

    server.get("/active_tasks", middleware! { | req, res |
        let tasklog = tasklog_active_tasks.lock().unwrap();
        get_active_tasks(&*tasklog)
    });
    server.post("/add_active_task", middleware! { | req, res |
        let new_a_task = req.json_as::<NewActiveTask>().unwrap();
        tasklog_add_active.lock().unwrap().add_active_task(
                                new_a_task.title,
                                new_a_task.description,
                                new_a_task.factor,
                                new_a_task.due_until).unwrap();
        "true"
    });

    server.get("/pooled_tasks", middleware! { | req, res |
        let tasklog = tasklog_pooled_tasks.lock().unwrap();
        get_pooled_tasks(&*tasklog)
    });

    server.post("/add_pooled_task", middleware! { | req, res |
        let new_p_task = req.json_as::<NewPooledTask>().unwrap();
        tasklog_add_pooled.lock().unwrap().add_pooled_task(
            new_p_task.title,
            new_p_task.description,
            new_p_task.factor,
            new_p_task.propability,
            new_p_task.cool_down,
            new_p_task.due_days
        ).unwrap();
        "true"
    });

    server.get("/pick_actives", middleware! { | req, res |
        let mut rng = StdRng::new().unwrap();
        tasklog_pick_actives.lock().unwrap().activate(&mut rng).unwrap();
        "true"
    });

    server.post("/finish", middleware! { | req, res |
        let obj = req.json_as::<TitleOnly>().unwrap();
        tasklog_finish.lock().unwrap().mark_done(obj.title);
        "true"
    });

    server.get("/log", middleware! {
        let tasklog = tasklog_log.lock().unwrap();
        buildLog(&tasklog.log)
    });

    server.get("/revert/:hash", middleware! { | request |
        let hash_str = request.param("hash");
        let hash = Hash::from_string(hash_str.unwrap().to_string());
        let mut tasklog = tasklog_revert.lock().unwrap();
        tasklog.log.reset_head(&hash);
        tasklog.load_head();
        "true"
    });

    server.utilize(StaticFilesHandler::new("web/"));

    server.listen("0.0.0.0:6767");
}
