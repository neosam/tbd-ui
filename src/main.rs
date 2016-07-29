#[macro_use] extern crate nickel;
#[macro_use] extern crate json;
extern crate rustc_serialize;

use nickel::{Nickel, HttpRouter, JsonBody};
use nickel::StaticFilesHandler;

fn get_active_tasks() -> json::JsonValue {
    array![
        object!{
            "title" => "Test",
            "deadline" => "2016-09-12"
        },
        object!{
            "title" => "Test2",
            "deadline" => "2016-10-15"
        }
    ]
}

#[derive(RustcDecodable, RustcEncodable)]
struct NewActiveTask {
    title: String,
    description: String,
    factor: f32,
    due_until: i32
}

fn main() {
    let mut server = Nickel::new();

    server.get("/hello", middleware!("Hello World"));
    server.get("/hello2", middleware!("Hello World2"));
    server.get("/active_tasks", middleware! { | req, res |
        let actives = get_active_tasks();
        json::stringify_pretty(actives, 2)
    });
    server.post("/add_active_task", middleware! { | req, res |
        let person = req.json_as::<NewActiveTask>().unwrap();
        print!("title: {}\n", person.title);
        "true"
    });
    server.utilize(StaticFilesHandler::new("web/"));

    server.listen("127.0.0.1:6767");
}
