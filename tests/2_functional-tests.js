const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

let issue1;

suite("Functional Tests", function () {
  suite("Routing Tests", function () {
    /// 3 POST requests
    suite("3 Post request Tests", function () {
      test("Create an issue with every field: POST request to /api/issues/{project}", function (done) {
        chai
          .request(server)
          .post(`/api/issues/testing1234`)
          .set("content-type", "application/json")
          .send({
            issue_title: "Test 1",
            issue_text: "This is a test issue with every field",
            created_by: "testuser",
            assigned_to: "assigneduser",
            status_text: "In Progress",
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            issue1 = res.body;
            assert.equal(res.body.issue_title, "Test 1");
            assert.equal(
              res.body.issue_text,
              "This is a test issue with every field"
            );
            assert.equal(res.body.created_by, "testuser");
            assert.equal(res.body.assigned_to, "assigneduser");
            assert.equal(res.body.status_text, "In Progress");
            done();
          });
      }).timeout(10000);

      test("Create an issue with only required fields: POST request to /api/issues/{project}", function (done) {
        chai
          .request(server)
          .post(`/api/issues/testing1234`)
          .set("content-type", "application/json")
          .send({
            issue_title: "Test 2",
            issue_text: "This is a test",
            created_by: "testuser",
            assigned_to: "",
            status_text: "",
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.issue_title, "Test 2");
            assert.equal(res.body.issue_text, "This is a test");
            assert.equal(res.body.created_by, "testuser");
            assert.equal(res.body.assigned_to, "");
            assert.equal(res.body.status_text, "");

            done();
          });
      }).timeout(5000);

      test("Create an issue with missing required fields: POST request to /api/issues/{project}", function (done) {
        chai
          .request(server)
          .post(`/api/issues/testing1234`)
          .send({
            issue_title: "",
            issue_text: "",
            created_by: "fCC",
            assigned_to: "",
            status_text: "",
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.property(res.body, "error", "Response should contain error");
            done();
          });
      });
    });
  });

  /// 3 GET Requests
  suite("3 Get request tests", function () {
    test("View issues on a project: GET request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .get(`/api/issues/testing1234`)
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body, "Response should be an array");
          done();
        });
    });
    test("View issues on a project with one filter: GET request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .get(`/api/issues/testing1234`)
        .query({
          _id: issue1._id,
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body[0].issue_title, issue1.issue_title);
          assert.equal(res.body[0].issue_text, issue1.issue_text);
          done();
        });
    });
    test("View issues on a project with multiple filters: GET request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .get("/api/issues/testing1234")
        .query({
          issue_title: issue1.issue_title,
          issue_text: issue1.issue_text,
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body[0].issue_title, issue1.issue_title);
          assert.equal(res.body[0].issue_text, issue1.issue_text);
          done();
        });
    });
  });

  ///  5 PUT Requests

  suite("5 Put request Tests", function () {
    test("Update one field on an issue: PUT request to /api/issues/testing1234", function (done) {
      chai
        .request(server)
        .put("/api/issues/testing1234")
        .send({
          _id: issue1._id,
          issue_title: "modified title",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, "successfully updated");
          assert.equal(res.body._id, issue1._id);
          done();
        });
    });
    test("Update multiple fields on an issue: PUT request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .put("/api/issues/testing1234")
        .send({
          _id: issue1._id,
          issue_title: "modified",
          issue_text: "modified",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, "successfully updated");
          assert.equal(res.body._id, issue1._id);
          done();
        });
    });
    test("Update an issue with missing _id: PUT request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .put("/api/issues/testing1234")
        .send({
          issue_title: "updated",
          issue_text: "updated",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "missing _id");
          done();
        });
    });
    test("Update an issue with no fields to update: PUT request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .put("/api/issues/testing1234")
        .send({
          _id: issue1._id,
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "no update field(s) sent");

          done();
        });
    });
    test("Update an issue with an invalid _id: PUT request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .put("/api/issues/testing1234")
        .send({
          _id: "5fe0c500e672341c1815a770",
          issue_title: "update",
          issue_text: "update",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "could not update");

          done();
        });
    });
  });

  /// 3 DELETE Requests

  suite("3 DELETE request Tests", function () {
    test("Delete an issue: DELETE request to /api/issues/testing1234", function (done) {
      chai
        .request(server)
        .delete("/api/issues/testing1234")
        .send({
          _id: issue1._id,
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, "successfully deleted");
          done();
        });
    });
    test("Delete an issue with an invalid _id: DELETE request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .delete("/api/issues/testing1234")
        .send({
          _id: "5fe0c500e672341c1815a770",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "could not delete");

          done();
        });
    });
    test("Delete an issue with missing _id: DELETE request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .delete("/api/issues/projects")
        .send({})
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "missing _id");
          done();
        });
    });
  });
});
