

CREATE TABLE shift (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shiftName TEXT NOT NULL,
    startAt TEXT NOT NULL,
    endAt TEXT NOT NULL,
    status INTEGER NOT NULL DEFAULT 0,
    color TEXT -- e.g., "green", "#ff0000"
);

CREATE TABLE IF NOT EXISTS DutyType (
    id INTEGER PRIMARY KEY AUTOINCREMENT,  -- unique identifier
    dutyName TEXT NOT NULL,                 -- name of the duty
    color TEXT NOT NULL,
    status INTEGER NOT NULL DEFAULT 0                     -- color code (e.g., '#FF0000')
);

CREATE TABLE IF NOT EXISTS DutyPlan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dutyDate TEXT NOT NULL,               -- store date as 'YYYY-MM-DD'
    shiftId INTEGER NOT NULL,             -- foreign key to Shift table
    hours REAL NOT NULL,                  -- number of hours
    startTime TEXT NOT NULL,              -- store time as 'HH:MM:SS'
    endTime TEXT NOT NULL,                -- store time as 'HH:MM:SS'
    dutyTypeId INTEGER NOT NULL,          -- foreign key to DutyType table
    FOREIGN KEY (shiftId) REFERENCES Shift(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (dutyTypeId) REFERENCES DutyType(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS DutySetting (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    minimumWeeklyHours REAL NOT NULL,  -- number of hours, e.g., 40.5
    weekStart TEXT NOT NULL,           -- weekday name
    weekEnd TEXT NOT NULL,             -- weekday name
    overTimeRate REAL NOT NULL,        -- amount for overtime
    dayOffRate REAL NOT NULL           -- amount for day off
);