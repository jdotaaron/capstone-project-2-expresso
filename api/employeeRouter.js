const express = require('express');
const employeeRouter = express.Router();
const timesheetsRouter = require('./timesheetsRouter');

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

employeeRouter.param('employeeId', (req, res, next, employeeId) => {
  const sql = "SELECT * FROM Employee WHERE Employee.id = $employeeId";
  const values = {$employeeId: employeeId};

  db.get(sql, values, (err, employee) => {
    if(err) {
      next(err);
    } else if(employee) {
      req.employee = employee;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

employeeRouter.use('/:employeeId/timesheets', timesheetsRouter);

employeeRouter.get('/', (req, res, next) => {
  db.all("SELECT * FROM Employee WHERE is_current_employee = 1", (err, employees) => {
    if(err) {
      next(err);
    } else {
      res.status(200).json({employees: employees});
    }
  });
});

employeeRouter.get('/:employeeId', (req, res, next) => {
  res.status(200).json({employee: req.employee});
});

employeeRouter.post('/', (req, res, next) => {
  const name = req.body.employee.name,
        position = req.body.employee.position,
        wage = req.body.employee.wage,
        employed = req.body.is_current_employee === 0 ? 0 : 1;
  if(!name || !position || !wage || !employed) {
    return res.sendStatus(400);
  }

  const sql = "INSERT INTO Employee (name, position, wage, is_current_employee) " +
              "VALUES ($name, $position, $wage, $employed)";
  const values = {
    $name: name,
    $position: position,
    $wage: wage,
    $employed: employed
  }

  db.run(sql, values, function(err) {
    if(err) {
      next(err);
    } else {
      db.get(`SELECT * FROM Employee WHERE Employee.id = ${this.lastID}`,
      (err, employee) =>{
        res.status(201).json({employee: employee});
      });
    }
  });
});

employeeRouter.put('/:employeeId', (req, res, next) => {
  const name = req.body.employee.name,
        position = req.body.employee.position,
        wage = req.body.employee.wage,
        employed = req.body.is_current_employee === 0 ? 0 : 1;
  if(!name || !position || !wage || !employed) {
    return res.sendStatus(400);
  }

  const sql = "UPDATE Employee SET name = $name, position = $position, wage = $wage, " +
              "is_current_employee = $employed WHERE Employee.id = $id";
  const values = {
    $name: name,
    $position: position,
    $wage: wage,
    $employed: employed,
    $id: req.params.employeeId
  };

  db.run(sql, values, (err, employee) => {
    if(err) {
      next(err);
    } else {
      db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`,
      (err, employee) => {
        res.status(200).json({employee: employee});
      });
    }
  });
});

employeeRouter.delete('/:employeeId', (req, res, next) => {
  const sql = "UPDATE Employee SET is_current_employee = 0 WHERE Employee.id = $id";
  const value = {$id: req.params.employeeId};

  db.run(sql, value, function(err) {
    if(err) {
      next(err);
    } else {
      db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`,
      (err, employee) =>{
        res.status(200).json({employee: employee});
      });
    }
  });
});

module.exports = employeeRouter;
