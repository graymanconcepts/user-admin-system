-- Engineering Department Structure
-- Engineering Manager
INSERT INTO users (email, name, password, roleId, departmentId, managerId, status)
VALUES ('engineering.manager@company.com', 'John Smith', '$2a$10$xVgXuq0UeKf0z7AXz8/H7.yNpwMjc3ZYyMxu7P8pCj8M1N6EeEYxO', 
        (SELECT id FROM roles WHERE name = 'manager'),
        (SELECT id FROM departments WHERE name = 'Engineering'),
        NULL,
        'active');

-- Senior Engineers (reporting to Engineering Manager)
INSERT INTO users (email, name, password, roleId, departmentId, managerId, status)
VALUES 
  ('senior.dev1@company.com', 'Alice Johnson', '$2a$10$xVgXuq0UeKf0z7AXz8/H7.yNpwMjc3ZYyMxu7P8pCj8M1N6EeEYxO',
   (SELECT id FROM roles WHERE name = 'employee'),
   (SELECT id FROM departments WHERE name = 'Engineering'),
   (SELECT id FROM users WHERE email = 'engineering.manager@company.com'),
   'active'),
   
  ('senior.dev2@company.com', 'Bob Wilson', '$2a$10$xVgXuq0UeKf0z7AXz8/H7.yNpwMjc3ZYyMxu7P8pCj8M1N6EeEYxO',
   (SELECT id FROM roles WHERE name = 'employee'),
   (SELECT id FROM departments WHERE name = 'Engineering'),
   (SELECT id FROM users WHERE email = 'engineering.manager@company.com'),
   'active');

-- Junior Engineers (reporting to Senior Engineers)
INSERT INTO users (email, name, password, roleId, departmentId, managerId, status)
VALUES 
  ('junior.dev1@company.com', 'Charlie Brown', '$2a$10$xVgXuq0UeKf0z7AXz8/H7.yNpwMjc3ZYyMxu7P8pCj8M1N6EeEYxO',
   (SELECT id FROM roles WHERE name = 'employee'),
   (SELECT id FROM departments WHERE name = 'Engineering'),
   (SELECT id FROM users WHERE email = 'senior.dev1@company.com'),
   'active'),
   
  ('junior.dev2@company.com', 'Diana Martinez', '$2a$10$xVgXuq0UeKf0z7AXz8/H7.yNpwMjc3ZYyMxu7P8pCj8M1N6EeEYxO',
   (SELECT id FROM roles WHERE name = 'employee'),
   (SELECT id FROM departments WHERE name = 'Engineering'),
   (SELECT id FROM users WHERE email = 'senior.dev2@company.com'),
   'active');

-- HR Department Structure
-- HR Manager
INSERT INTO users (email, name, password, roleId, departmentId, managerId, status)
VALUES ('hr.manager@company.com', 'Sarah Davis', '$2a$10$xVgXuq0UeKf0z7AXz8/H7.yNpwMjc3ZYyMxu7P8pCj8M1N6EeEYxO',
        (SELECT id FROM roles WHERE name = 'manager'),
        (SELECT id FROM departments WHERE name = 'HR'),
        NULL,
        'active');

-- HR Team Members
INSERT INTO users (email, name, password, roleId, departmentId, managerId, status)
VALUES 
  ('hr.specialist1@company.com', 'Michael Lee', '$2a$10$xVgXuq0UeKf0z7AXz8/H7.yNpwMjc3ZYyMxu7P8pCj8M1N6EeEYxO',
   (SELECT id FROM roles WHERE name = 'employee'),
   (SELECT id FROM departments WHERE name = 'HR'),
   (SELECT id FROM users WHERE email = 'hr.manager@company.com'),
   'active');

-- Sales Department Structure
-- Sales Manager
INSERT INTO users (email, name, password, roleId, departmentId, managerId, status)
VALUES ('sales.manager@company.com', 'David Wilson', '$2a$10$xVgXuq0UeKf0z7AXz8/H7.yNpwMjc3ZYyMxu7P8pCj8M1N6EeEYxO',
        (SELECT id FROM roles WHERE name = 'manager'),
        (SELECT id FROM departments WHERE name = 'Sales'),
        NULL,
        'active');

-- Sales Team Members
INSERT INTO users (email, name, password, roleId, departmentId, managerId, status)
VALUES 
  ('sales.rep1@company.com', 'Emma Thompson', '$2a$10$xVgXuq0UeKf0z7AXz8/H7.yNpwMjc3ZYyMxu7P8pCj8M1N6EeEYxO',
   (SELECT id FROM roles WHERE name = 'employee'),
   (SELECT id FROM departments WHERE name = 'Sales'),
   (SELECT id FROM users WHERE email = 'sales.manager@company.com'),
   'active'),
   
  ('sales.rep2@company.com', 'Frank Rodriguez', '$2a$10$xVgXuq0UeKf0z7AXz8/H7.yNpwMjc3ZYyMxu7P8pCj8M1N6EeEYxO',
   (SELECT id FROM roles WHERE name = 'employee'),
   (SELECT id FROM departments WHERE name = 'Sales'),
   (SELECT id FROM users WHERE email = 'sales.manager@company.com'),
   'active');
