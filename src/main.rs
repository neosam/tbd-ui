#[macro_use] extern crate nickel;
//#[macro_use] extern crate json;
extern crate rustc_serialize;

use nickel::{Nickel, HttpRouter, JsonBody};
use nickel::StaticFilesHandler;
use rustc_serialize::json;

fn get_active_tasks() -> String {
    let list = vec![
        SendActiveTask {
            title: "title1".to_string(),
            due_date: "2016-08-20".to_string()
        },
        SendActiveTask {
            title: "title2".to_string(),
            due_date: "2016-09-24".to_string()
        }
    ];
    json::encode(&list).unwrap()
}

#[derive(RustcDecodable, RustcEncodable)]
struct NewActiveTask {
    title: String,
    description: String,
    factor: f32,
    due_until: i32
}

#[derive(Clone, RustcDecodable, RustcEncodable)]
struct SendActiveTask {
    title: String,
    due_date: String
}

fn main() {
    let mut server = Nickel::new();

    server.get("/hello", middleware!("Hello World"));
    server.get("/hello2", middleware!("Hello World2"));
    server.get("/active_tasks", middleware! { | req, res |
        get_active_tasks()
    });
    server.post("/add_active_task", middleware! { | req, res |
        let person = req.json_as::<NewActiveTask>().unwrap();
        print!("title: {}\n", person.title);
        "true"
    });
    server.utilize(StaticFilesHandler::new("web/"));

    server.listen("127.0.0.1:6767");
}
