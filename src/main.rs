#[macro_use] extern crate nickel;
//#[macro_use] extern crate json;
extern crate rustc_serialize;
extern crate tbd;

use nickel::{Nickel, HttpRouter, JsonBody};
use nickel::StaticFilesHandler;
use rustc_serialize::json;
use tbd::{task, tasklog};
use tbd::task::{ActiveTask,TaskStatTrait};
use tbd::tasklog::TaskLog;
use std::sync::{Arc, Mutex};

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

#[derive(RustcDecodable, RustcEncodable)]
struct NewActiveTask {
    title: String,
    description: String,
    factor: f32,
    due_until: i16
}

#[derive(Clone, RustcDecodable, RustcEncodable)]
struct SendActiveTask {
    title: String,
    due_date: String
}

fn main() {
    let mut server = Nickel::new();
    let mut tasklog = TaskLog::new(".tbd".to_string());
    tasklog.load_head();
    let tasklog_active_tasks = Arc::new(Mutex::new(tasklog));
    let tasklog_add_active = tasklog_active_tasks.clone();

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
    server.utilize(StaticFilesHandler::new("web/"));

    server.listen("127.0.0.1:6767");
}
