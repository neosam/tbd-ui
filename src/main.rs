#[macro_use] extern crate nickel;
#[macro_use] extern crate json;

use nickel::{Nickel, HttpRouter};
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

fn main() {
    let mut server = Nickel::new();

    server.get("/hello", middleware!("Hello World"));
    server.get("/hello2", middleware!("Hello World2"));
    server.get("/active_tasks", middleware! { | req, res |
        let actives = get_active_tasks();
        json::stringify_pretty(actives, 2)
    });
    server.utilize(StaticFilesHandler::new("web/"));

    server.listen("127.0.0.1:6767");
}
