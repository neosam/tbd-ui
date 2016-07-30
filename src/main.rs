#[macro_use] extern crate nickel;
//#[macro_use] extern crate json;
extern crate rustc_serialize;
extern crate tbd;
extern crate time;

use nickel::{Nickel, HttpRouter, JsonBody};
use nickel::StaticFilesHandler;
use rustc_serialize::json;
use tbd::{task, tasklog};
use tbd::task::{ActiveTask, PooledTask, TaskStatTrait};
use tbd::tasklog::TaskLog;
use std::sync::{Arc, Mutex};
use time::{Tm, Duration};

fn get_active_tasks<T: TaskStatTrait>(task_stat: &T) -> String {
    let active_tasks = task_stat.all_actives().unwrap_or(Vec::<ActiveTask>::new());
    let mut res = Vec::new();
    for a_task in active_tasks {
        let due_date = format!("{}-{}-{}",
                               a_task.due.tm_year + 1900,
                               a_task.due.tm_mon + 1,
                               a_task.due.tm_mday);
        res.push(SendActiveTask {
            title: a_task.task.title,
            due_date: due_date
        });
    };
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
    due_date: String
}

#[derive(Clone, RustcDecodable, RustcEncodable)]
struct SendPooledTask {
    title: String,
    due_days: i16,
    propability: f32,
    cool_down: i16,
    cooling_until: i16
}

fn main() {
    let mut server = Nickel::new();
    let mut tasklog = TaskLog::new(".tbd".to_string());
    tasklog.load_head();
    let tasklog_active_tasks = Arc::new(Mutex::new(tasklog));
    let tasklog_add_active = tasklog_active_tasks.clone();
    let tasklog_pooled_tasks = tasklog_active_tasks.clone();
    let tasklog_add_pooled = tasklog_active_tasks.clone();

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

    server.utilize(StaticFilesHandler::new("web/"));

    server.listen("127.0.0.1:6767");
}
