const express = require('express');
const timesheetsRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

timesheetsRouter.param('timesheetId', (req, res, next, timesheetId) => {
  const sql = "SELECT * FROM Timesheet WHERE Timesheet.id = $timesheetId";
  const value = {$timesheetId: timesheetId};

  db.get(sql, value, (error, timesheet) =>{
    if(error) {
      next(error);
    } else if(timesheet) {
      res.timesheet = timesheet;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

timesheetsRouter.get('/', (req, res, next) => {
  const sql = "SELECT * FROM Timesheet WHERE Timesheet.employee_id = $id";
  const value = {$id: req.params.employeeId};

  db.all(sql, value, (err, timesheets) => {
    if(err) {
      next(err);
    } else {
      res.status(200).json({timesheets: timesheets});
    }
  });
});

timesheetsRouter.post('/', (req, res, next) => {
  const hours = req.body.timesheet.hours,
        rate = req.body.timesheet.rate,
        date = req.body.timesheet.date;
  const employeeSql = "SELECT * FROM Employee WHERE Employee.id = $id";
  const employeeValue = {$id: req.params.employeeId};
  db.get(employeeSql, employeeValue, (err, employee) =>{
    if(err) {
      next(err);
    } else {
      if(!hours || !rate || !date) {
        return res.sendStatus(400);
      }

      const sql = "INSERT INTO Timesheet (hours, rate, date, employee_id) " +
                  "VALUES ($hours, $rate, $date, $employeeId)"
      const values = {
        $hours: hours,
        $rate: rate,
        $date: date,
        $employeeId: req.params.employeeId
      };

      db.run(sql, values, function(err) {
        if(err) {
          next(err);
        } else {
          db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${this.lastID}`,
          (err, timesheet) => {
            res.status(201).json({timesheet: timesheet});
          });
        }
      });
    }
  });
});

timesheetsRouter.put('/:timesheetId', (req, res, next) => {
  const hours = req.body.timesheet.hours,
        rate = req.body.timesheet.rate,
        date = req.body.timesheet.date;
  const employeeSql = "SELECT * FROM Employee WHERE Employee.id = $id";
  const employeeValue = {$id: req.params.employeeId};

  db.get(employeeSql, employeeValue, (err, employee) =>{
    if(err) {
      next(err);
    } else {
      if(!hours || !rate || !date) {
        return res.sendStatus(400);
      }

      const sql = "UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date " +
                  "WHERE Timesheet.id = $timesheetId";
      const values = {
        $hours: hours,
        $rate: rate,
        $date: date,
        $timesheetId: req.params.timesheetId
      };

      db.run(sql, values, function(err) {
        if(err) {
          next(err);
        } else {
          db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${req.params.timesheetId}`,
          (err, timesheet) => {
            res.status(200).json({timesheet: timesheet});
          });
        }
      });
    }
  });
});

timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
  const sql = "DELETE FROM Timesheet WHERE Timesheet.id = $id";
  const value = {$id: req.params.timesheetId};

  db.run(sql, value, (err) => {
    if(err) {
      next(err);
    } else {
      res.sendStatus(204);
    }
  });
});

module.exports = timesheetsRouter;
