#[macro_use] extern crate nickel;

use nickel::{Nickel, HttpRouter};
use nickel::StaticFilesHandler;

fn main() {
    let mut server = Nickel::new();

    server.get("/hello", middleware!("Hello World"));
    server.utilize(StaticFilesHandler::new("web/"));

    server.listen("127.0.0.1:6767");
}
