-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 03, 2026 at 03:57 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `epms`
--

-- --------------------------------------------------------

--
-- Table structure for table `department`
--

CREATE TABLE `department` (
  `departmentCode` varchar(10) NOT NULL,
  `departmentName` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `department`
--

INSERT INTO `department` (`departmentCode`, `departmentName`) VALUES
('NP', 'Bussiness'),
('FIN', 'Finance'),
('HR', 'Human Resources'),
('IT', 'Information Technology'),
('MKT', 'Marketing');

-- --------------------------------------------------------

--
-- Table structure for table `employee`
--

CREATE TABLE `employee` (
  `employeeNumber` int(11) NOT NULL,
  `firstName` varchar(50) NOT NULL,
  `lastName` varchar(50) NOT NULL,
  `address` text DEFAULT NULL,
  `positionCode` varchar(10) DEFAULT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `gender` enum('Male','Female','Other') NOT NULL,
  `hiredDate` date NOT NULL,
  `departmentCode` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employee`
--

INSERT INTO `employee` (`employeeNumber`, `firstName`, `lastName`, `address`, `positionCode`, `telephone`, `gender`, `hiredDate`, `departmentCode`) VALUES
(1, 'steven', 'Irankunda', 'ffffff', NULL, '0485478573', 'Male', '2026-06-25', 'FIN'),
(2, 'Byiringiro', 'Jean', 'dfghh', 'DEV', '071223445', 'Male', '2026-06-03', 'FIN');

-- --------------------------------------------------------

--
-- Table structure for table `positions`
--

CREATE TABLE `positions` (
  `positionCode` varchar(10) NOT NULL,
  `positionName` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `baseSalary` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `positions`
--

INSERT INTO `positions` (`positionCode`, `positionName`, `description`, `baseSalary`) VALUES
('ACC', 'Accountant', 'Finance Accountant', 55000.00),
('DEV', 'Developer', 'Software Developer', 60000.00),
('HRSP', 'HR Specialist', 'Human Resources Specialist', 50000.00),
('MGR', 'Manager', 'Department Manager', 75000.00),
('MKTSP', 'Marketing Specialist', 'Marketing Specialist', 52000.00),
('TPN', 'Machanics', 'eieie', 12.00);

-- --------------------------------------------------------

--
-- Table structure for table `salary`
--

CREATE TABLE `salary` (
  `id` int(11) NOT NULL,
  `employeeNumber` int(11) NOT NULL,
  `grossSalary` decimal(10,2) NOT NULL,
  `totalDeduction` decimal(10,2) NOT NULL DEFAULT 0.00,
  `netSalary` decimal(10,2) NOT NULL,
  `monthOfPayment` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `salary`
--

INSERT INTO `salary` (`id`, `employeeNumber`, `grossSalary`, `totalDeduction`, `netSalary`, `monthOfPayment`) VALUES
(1, 1, 2234.00, 12.00, 2222.00, '0000-00-00');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `createdAt`) VALUES
(1, 'steven', '$2b$10$qw4nplQ2Z1BVduHIeueEquiOdI6U7qDOgb45d/ao/2gtyWBxi1CxK', '2026-06-02 19:28:55'),
(2, 'stevo', '$2b$10$/ihwlFP.A8tvKk8BGeokse9cxMMfXRFRgNoUQJBU.hKvJ9M1wrbHO', '2026-06-03 01:22:28'),
(3, 'steven1', '$2b$10$4N6gYvqCHWirlxR.LK3ULenhq7mLPSJtK4o/shssmZ6DHKrx4nAkW', '2026-06-03 01:24:07'),
(4, 'testuser', '$2b$10$lsoXObTH0UvW.oWDg0K5QeJ2tfku4.QqbzrpqPD3Z3u3cmLzr55Ci', '2026-06-03 01:30:15');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `department`
--
ALTER TABLE `department`
  ADD PRIMARY KEY (`departmentCode`),
  ADD UNIQUE KEY `departmentName` (`departmentName`);

--
-- Indexes for table `employee`
--
ALTER TABLE `employee`
  ADD PRIMARY KEY (`employeeNumber`),
  ADD KEY `departmentCode` (`departmentCode`);

--
-- Indexes for table `positions`
--
ALTER TABLE `positions`
  ADD PRIMARY KEY (`positionCode`);

--
-- Indexes for table `salary`
--
ALTER TABLE `salary`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_employee_month` (`employeeNumber`,`monthOfPayment`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `employee`
--
ALTER TABLE `employee`
  MODIFY `employeeNumber` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `salary`
--
ALTER TABLE `salary`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `employee`
--
ALTER TABLE `employee`
  ADD CONSTRAINT `employee_ibfk_1` FOREIGN KEY (`departmentCode`) REFERENCES `department` (`departmentCode`) ON DELETE SET NULL;

--
-- Constraints for table `salary`
--
ALTER TABLE `salary`
  ADD CONSTRAINT `salary_ibfk_1` FOREIGN KEY (`employeeNumber`) REFERENCES `employee` (`employeeNumber`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
