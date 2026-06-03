// server.js
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');


const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection pool
const pool = mysql.createPool({
    host:'localhost',
    user: 'root',
    password:'',
    database:'EPMS',
   
});

const promisePool = pool.promise();

// JWT Secret
const JWT_SECRET = 'your-secret-key-change-this';

// Initialize database and tables
const initDatabase = async () => {
    try {
        // Create database if not exists
        await promisePool.query('CREATE DATABASE IF NOT EXISTS EPMS');
        await promisePool.query('USE EPMS');
        
        // Create users table
        await promisePool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Create department table
        await promisePool.query(`
            CREATE TABLE IF NOT EXISTS department (
                departmentCode VARCHAR(10) PRIMARY KEY,
                departmentName VARCHAR(100) NOT NULL
            )
        `);
        
        // Create positions table
        await promisePool.query(`
            CREATE TABLE IF NOT EXISTS positions (
                positionCode VARCHAR(10) PRIMARY KEY,
                positionName VARCHAR(100) NOT NULL,
                description TEXT,
                baseSalary DECIMAL(10, 2)
            )
        `);
        
        // Create employee table
        await promisePool.query(`
            CREATE TABLE IF NOT EXISTS employee (
                employeeNumber VARCHAR(20) PRIMARY KEY,
                firstName VARCHAR(50) NOT NULL,
                lastName VARCHAR(50) NOT NULL,
                address TEXT,
                positionCode VARCHAR(10),
                departmentCode VARCHAR(10),
                telephone VARCHAR(20),
                gender ENUM('Male', 'Female', 'Other'),
                hiredDate DATE,
                FOREIGN KEY (positionCode) REFERENCES positions(positionCode) ON DELETE SET NULL,
                FOREIGN KEY (departmentCode) REFERENCES department(departmentCode) ON DELETE SET NULL
            )
        `);

        // Migrate legacy employee schema if needed
        const [legacyPositionColumn] = await promisePool.query(`
            SELECT COLUMN_NAME
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = 'EPMS'
              AND TABLE_NAME = 'employee'
              AND COLUMN_NAME = 'position'
        `);
        if (legacyPositionColumn.length > 0) {
            await promisePool.query('ALTER TABLE employee CHANGE COLUMN position positionCode VARCHAR(10) DEFAULT NULL');
            console.log('Migrated legacy employee.position to employee.positionCode');
        }
        
        // Create salary table
        await promisePool.query(`
            CREATE TABLE IF NOT EXISTS salary (
                id INT PRIMARY KEY AUTO_INCREMENT,
                employeeNumber VARCHAR(20),
                grossSalary DECIMAL(10, 2) NOT NULL,
                totalDeduction DECIMAL(10, 2) DEFAULT 0,
                netSalary DECIMAL(10, 2) NOT NULL,
                monthOfPayment DATE NOT NULL,
                FOREIGN KEY (employeeNumber) REFERENCES employee(employeeNumber) ON DELETE CASCADE
            )
        `);
        
        console.log('Database and tables initialized successfully');
        
        // Insert sample data if tables are empty
        await insertSampleData();
        
    } catch (error) {
        console.error('Database initialization error:', error);
    }
};

const insertSampleData = async () => {
    try {
        // Check if department table is empty
        const [deptRows] = await promisePool.query('SELECT COUNT(*) as count FROM department');
        if (deptRows[0].count === 0) {
            await promisePool.query(`
                INSERT INTO department (departmentCode, departmentName) VALUES
                ('HR', 'Human Resources'),
                ('IT', 'Information Technology'),
                ('FIN', 'Finance'),
                ('MKT', 'Marketing'),
                ('OPS', 'Operations')
            `);
        }
        
        // Check if positions table is empty
        const [posRows] = await promisePool.query('SELECT COUNT(*) as count FROM positions');
        if (posRows[0].count === 0) {
            await promisePool.query(`
                INSERT INTO positions (positionCode, positionName, description, baseSalary) VALUES
                ('MGR', 'Manager', 'Department Manager', 75000),
                ('DEV', 'Developer', 'Software Developer', 60000),
                ('ACC', 'Accountant', 'Finance Accountant', 55000),
                ('HRSP', 'HR Specialist', 'Human Resources Specialist', 50000),
                ('MKTSP', 'Marketing Specialist', 'Marketing Specialist', 52000)
            `);
        }
        
        // Check if employee table is empty
        const [empRows] = await promisePool.query('SELECT COUNT(*) as count FROM employee');
        if (empRows[0].count === 0) {
            await promisePool.query(`
                INSERT INTO employee (employeeNumber, firstName, lastName, address, positionCode, departmentCode, telephone, gender, hiredDate) VALUES
                ('EMP001', 'John', 'Doe', '123 Main St', 'MGR', 'IT', '555-0101', 'Male', '2020-01-15'),
                ('EMP002', 'Jane', 'Smith', '456 Oak Ave', 'DEV', 'IT', '555-0102', 'Female', '2021-03-20'),
                ('EMP003', 'Bob', 'Johnson', '789 Pine Rd', 'ACC', 'FIN', '555-0103', 'Male', '2019-06-10')
            `);
        }
        
    } catch (error) {
        console.error('Sample data insertion error:', error);
    }
};

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// ==================== AUTH ROUTES ====================
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }
        
        // Check if user exists
        const [existing] = await promisePool.query('SELECT * FROM users WHERE username = ?', [username]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert user
        await promisePool.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
        
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }
        
        // Get user
        const [users] = await promisePool.query('SELECT * FROM users WHERE username = ?', [username]);
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const user = users[0];
        
        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Generate token
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
        
        res.json({ token, username: user.username });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// ==================== EMPLOYEE ROUTES ====================
app.get('/api/employees', authenticateToken, async (req, res) => {
    try {
        const [employees] = await promisePool.query(`
            SELECT e.*, d.departmentName, p.positionName 
            FROM employee e
            LEFT JOIN department d ON e.departmentCode = d.departmentCode
            LEFT JOIN positions p ON e.positionCode = p.positionCode
            ORDER BY e.employeeNumber
        `);
        res.json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ error: 'Failed to fetch employees' });
    }
});

app.post('/api/employees', authenticateToken, async (req, res) => {
    try {
        const { employeeNumber, firstName, lastName, address, positionCode, departmentCode, telephone, gender, hiredDate } = req.body;
        
        const normalizedAddress = address || null;
        const normalizedPositionCode = positionCode || null;
        const normalizedDepartmentCode = departmentCode || null;
        const normalizedTelephone = telephone || null;
        
        // Check if employee already exists
        const [existing] = await promisePool.query('SELECT * FROM employee WHERE employeeNumber = ?', [employeeNumber]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Employee number already exists' });
        }
        
        await promisePool.query(
            'INSERT INTO employee (employeeNumber, firstName, lastName, address, positionCode, departmentCode, telephone, gender, hiredDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [employeeNumber, firstName, lastName, normalizedAddress, normalizedPositionCode, normalizedDepartmentCode, normalizedTelephone, gender, hiredDate]
        );
        
        res.status(201).json({ message: 'Employee created successfully' });
    } catch (error) {
        console.error('Error creating employee:', error);
        res.status(500).json({ error: 'Failed to create employee' });
    }
});

app.put('/api/employees/:employeeNumber', authenticateToken, async (req, res) => {
    try {
        const { employeeNumber } = req.params;
        const { firstName, lastName, address, positionCode, departmentCode, telephone, gender, hiredDate } = req.body;
        
        const normalizedAddress = address || null;
        const normalizedPositionCode = positionCode || null;
        const normalizedDepartmentCode = departmentCode || null;
        const normalizedTelephone = telephone || null;
        
        await promisePool.query(
            'UPDATE employee SET firstName=?, lastName=?, address=?, positionCode=?, departmentCode=?, telephone=?, gender=?, hiredDate=? WHERE employeeNumber=?',
            [firstName, lastName, normalizedAddress, normalizedPositionCode, normalizedDepartmentCode, normalizedTelephone, gender, hiredDate, employeeNumber]
        );
        
        res.json({ message: 'Employee updated successfully' });
    } catch (error) {
        console.error('Error updating employee:', error);
        res.status(500).json({ error: 'Failed to update employee' });
    }
});

app.delete('/api/employees/:employeeNumber', authenticateToken, async (req, res) => {
    try {
        const { employeeNumber } = req.params;
        
        // Salary records will be deleted automatically due to CASCADE
        await promisePool.query('DELETE FROM employee WHERE employeeNumber = ?', [employeeNumber]);
        
        res.json({ message: 'Employee deleted successfully' });
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ error: 'Failed to delete employee' });
    }
});

// ==================== DEPARTMENT ROUTES ====================
app.get('/api/departments', authenticateToken, async (req, res) => {
    try {
        const [departments] = await promisePool.query('SELECT * FROM department ORDER BY departmentCode');
        res.json(departments);
    } catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).json({ error: 'Failed to fetch departments' });
    }
});

app.post('/api/departments', authenticateToken, async (req, res) => {
    try {
        const { departmentCode, departmentName } = req.body;
        
        const [existing] = await promisePool.query('SELECT * FROM department WHERE departmentCode = ?', [departmentCode]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Department code already exists' });
        }
        
        await promisePool.query('INSERT INTO department (departmentCode, departmentName) VALUES (?, ?)', [departmentCode, departmentName]);
        res.status(201).json({ message: 'Department created successfully' });
    } catch (error) {
        console.error('Error creating department:', error);
        res.status(500).json({ error: 'Failed to create department' });
    }
});

app.put('/api/departments/:departmentCode', authenticateToken, async (req, res) => {
    try {
        const { departmentCode } = req.params;
        const { departmentName } = req.body;
        
        await promisePool.query('UPDATE department SET departmentName=? WHERE departmentCode=?', [departmentName, departmentCode]);
        res.json({ message: 'Department updated successfully' });
    } catch (error) {
        console.error('Error updating department:', error);
        res.status(500).json({ error: 'Failed to update department' });
    }
});

app.delete('/api/departments/:departmentCode', authenticateToken, async (req, res) => {
    try {
        const { departmentCode } = req.params;
        
        // Check if department has employees
        const [employees] = await promisePool.query('SELECT * FROM employee WHERE departmentCode = ?', [departmentCode]);
        if (employees.length > 0) {
            return res.status(400).json({ error: 'Cannot delete department with assigned employees' });
        }
        
        await promisePool.query('DELETE FROM department WHERE departmentCode = ?', [departmentCode]);
        res.json({ message: 'Department deleted successfully' });
    } catch (error) {
        console.error('Error deleting department:', error);
        res.status(500).json({ error: 'Failed to delete department' });
    }
});

// ==================== POSITION ROUTES ====================
app.get('/api/positions', authenticateToken, async (req, res) => {
    try {
        const [positions] = await promisePool.query('SELECT * FROM positions ORDER BY positionCode');
        res.json(positions);
    } catch (error) {
        console.error('Error fetching positions:', error);
        res.status(500).json({ error: 'Failed to fetch positions' });
    }
});

app.post('/api/positions', authenticateToken, async (req, res) => {
    try {
        const { positionCode, positionName, description, baseSalary } = req.body;
        
        const [existing] = await promisePool.query('SELECT * FROM positions WHERE positionCode = ?', [positionCode]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Position code already exists' });
        }
        
        await promisePool.query(
            'INSERT INTO positions (positionCode, positionName, description, baseSalary) VALUES (?, ?, ?, ?)',
            [positionCode, positionName, description, baseSalary]
        );
        res.status(201).json({ message: 'Position created successfully' });
    } catch (error) {
        console.error('Error creating position:', error);
        res.status(500).json({ error: 'Failed to create position' });
    }
});

app.put('/api/positions/:positionCode', authenticateToken, async (req, res) => {
    try {
        const { positionCode } = req.params;
        const { positionName, description, baseSalary } = req.body;
        
        await promisePool.query(
            'UPDATE positions SET positionName=?, description=?, baseSalary=? WHERE positionCode=?',
            [positionName, description, baseSalary, positionCode]
        );
        res.json({ message: 'Position updated successfully' });
    } catch (error) {
        console.error('Error updating position:', error);
        res.status(500).json({ error: 'Failed to update position' });
    }
});

app.delete('/api/positions/:positionCode', authenticateToken, async (req, res) => {
    try {
        const { positionCode } = req.params;
        
        // Check if position has employees
        const [employees] = await promisePool.query('SELECT * FROM employee WHERE positionCode = ?', [positionCode]);
        if (employees.length > 0) {
            return res.status(400).json({ error: 'Cannot delete position with assigned employees' });
        }
        
        await promisePool.query('DELETE FROM positions WHERE positionCode = ?', [positionCode]);
        res.json({ message: 'Position deleted successfully' });
    } catch (error) {
        console.error('Error deleting position:', error);
        res.status(500).json({ error: 'Failed to delete position' });
    }
});

// ==================== SALARY ROUTES ====================
app.get('/api/salaries', authenticateToken, async (req, res) => {
    try {
        const [salaries] = await promisePool.query(`
            SELECT s.*, e.firstName, e.lastName, e.employeeNumber
            FROM salary s
            JOIN employee e ON s.employeeNumber = e.employeeNumber
            ORDER BY s.monthOfPayment DESC, s.id
        `);
        res.json(salaries);
    } catch (error) {
        console.error('Error fetching salaries:', error);
        res.status(500).json({ error: 'Failed to fetch salaries' });
    }
});

app.post('/api/salaries', authenticateToken, async (req, res) => {
    try {
        const { employeeNumber, grossSalary, totalDeduction, netSalary, monthOfPayment } = req.body;
        
        // Check if employee exists
        const [employee] = await promisePool.query('SELECT * FROM employee WHERE employeeNumber = ?', [employeeNumber]);
        if (employee.length === 0) {
            return res.status(400).json({ error: 'Employee not found' });
        }
        
        await promisePool.query(
            'INSERT INTO salary (employeeNumber, grossSalary, totalDeduction, netSalary, monthOfPayment) VALUES (?, ?, ?, ?, ?)',
            [employeeNumber, grossSalary, totalDeduction || 0, netSalary, monthOfPayment]
        );
        res.status(201).json({ message: 'Salary record created successfully' });
    } catch (error) {
        console.error('Error creating salary:', error);
        res.status(500).json({ error: 'Failed to create salary record' });
    }
});

app.put('/api/salaries/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { grossSalary, totalDeduction, netSalary, monthOfPayment } = req.body;
        
        await promisePool.query(
            'UPDATE salary SET grossSalary=?, totalDeduction=?, netSalary=?, monthOfPayment=? WHERE id=?',
            [grossSalary, totalDeduction, netSalary, monthOfPayment, id]
        );
        res.json({ message: 'Salary record updated successfully' });
    } catch (error) {
        console.error('Error updating salary:', error);
        res.status(500).json({ error: 'Failed to update salary record' });
    }
});

app.delete('/api/salaries/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        await promisePool.query('DELETE FROM salary WHERE id = ?', [id]);
        res.json({ message: 'Salary record deleted successfully' });
    } catch (error) {
        console.error('Error deleting salary:', error);
        res.status(500).json({ error: 'Failed to delete salary record' });
    }
});

// Error handler for invalid JSON payloads
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error('JSON parse error:', err.message);
        return res.status(400).json({ error: 'Invalid JSON payload' });
    }
    next(err);
});

// Start server
app.listen(PORT, async () => {
    await initDatabase();
    console.log(`Server running on port ${PORT}`);
});