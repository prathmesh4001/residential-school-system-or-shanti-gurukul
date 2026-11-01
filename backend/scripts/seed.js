/* ============================================================
   SHANTI GURUKUL — MongoDB Database Seeder
   scripts/seed.js : Seeds MongoDB with initial demo data
   ============================================================ */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import { User } from '../models/User.js';
import { Student } from '../models/Student.js';
import { Staff } from '../models/Staff.js';
import { Attendance } from '../models/Attendance.js';
import { FeePayment } from '../models/Fee.js';
import { Result } from '../models/Result.js';
import { HostelRoom, HostelLeave } from '../models/Hostel.js';
import { Notice } from '../models/Notice.js';
import { MessMenu } from '../models/Mess.js';
import { Medical } from '../models/Medical.js';
import { Expense } from '../models/Expense.js';
import { TeacherLeave } from '../models/TeacherLeave.js';
import { Timetable } from '../models/Timetable.js';
import { Achievement } from '../models/Achievement.js';
import { Sports } from '../models/Sports.js';
import { Mentor } from '../models/Mentor.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shanti_gurukul';

async function seed() {
  try {
    console.log(`🍃 Connecting to MongoDB at ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected. Clearing existing collections...');

    await Promise.all([
      User.deleteMany({}),
      Student.deleteMany({}),
      Staff.deleteMany({}),
      Attendance.deleteMany({}),
      FeePayment.deleteMany({}),
      Result.deleteMany({}),
      HostelRoom.deleteMany({}),
      HostelLeave.deleteMany({}),
      Notice.deleteMany({}),
      MessMenu.deleteMany({}),
      Medical.deleteMany({}),
      Expense.deleteMany({}),
      TeacherLeave.deleteMany({}),
      Timetable.deleteMany({}),
      Achievement.deleteMany({}),
      Sports.deleteMany({}),
      Mentor.deleteMany({}),
    ]);

    console.log('🌱 Seeding Users...');
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const hashedTeacherPassword = await bcrypt.hash('teacher123', 10);
    const hashedParentPassword = await bcrypt.hash('parent123', 10);

    await User.insertMany([
      { username: 'admin',     password: hashedAdminPassword,   name: 'System Administrator', role: 'admin',     email: 'admin@gurukul.in' },
      { username: 'principal', password: hashedAdminPassword,   name: 'Dr. Ramesh Pawar',     role: 'principal', email: 'principal@gurukul.in' },
      { username: 'teacher1',  password: hashedTeacherPassword, name: 'Mr. Ramesh Gupta',     role: 'teacher',   email: 'ramesh@gurukul.in' },
      { username: 'warden',    password: hashedTeacherPassword, name: 'Mr. Anand Gokhale',    role: 'warden',    email: 'anand@gurukul.in' },
      { username: 'parent1',   password: hashedParentPassword,  name: 'Mr. Rajesh Sharma',    role: 'parent',    email: 'rajesh@gmail.com', studentId: 'STU-2024-001' }
    ]);

    console.log('🌱 Seeding Students...');
    await Student.insertMany([
      { id:'STU-2024-001', rollNo:'STU-2024-001', name:'Aarav Sharma',   class:'10', section:'A', type:'residential', gender:'Male',   contact:'9876543210', address:'Nagpur', dob:'2009-05-12', parentName:'Rajesh Sharma', bloodGroup:'B+' },
      { id:'STU-2024-002', rollNo:'STU-2024-002', name:'Priya Patil',    class:'9',  section:'A', type:'residential', gender:'Female',  contact:'9876543211', address:'Pune',   dob:'2010-03-22', parentName:'Sunil Patil',   bloodGroup:'A+' },
      { id:'STU-2024-003', rollNo:'STU-2024-003', name:'Rohan Desai',    class:'8',  section:'A', type:'day',         gender:'Male',   contact:'9876543212', address:'Nashik', dob:'2011-07-15', parentName:'Vikas Desai',   bloodGroup:'O+' },
      { id:'STU-2024-004', rollNo:'STU-2024-004', name:'Sneha Kulkarni', class:'10', section:'A', type:'residential', gender:'Female',  contact:'9876543213', address:'Aurangabad', dob:'2009-11-30', parentName:'Anand Kulkarni', bloodGroup:'O+' },
      { id:'STU-2024-005', rollNo:'STU-2024-005', name:'Arjun Joshi',    class:'7',  section:'A', type:'day',         gender:'Male',   contact:'9876543214', address:'Solapur', dob:'2012-02-18', parentName:'Manoj Joshi',   bloodGroup:'B+' },
      { id:'STU-2024-006', rollNo:'STU-2024-006', name:'Kavya Shinde',   class:'9',  section:'A', type:'residential', gender:'Female',  contact:'9876543215', address:'Kolhapur', dob:'2010-08-25', parentName:'Suresh Shinde', bloodGroup:'AB+' },
      { id:'STU-2024-007', rollNo:'STU-2024-007', name:'Vikram Nair',    class:'6',  section:'A', type:'day',         gender:'Male',   contact:'9876543216', address:'Nagpur', dob:'2013-04-10', parentName:'Gopal Nair',   bloodGroup:'A-' },
      { id:'STU-2024-008', rollNo:'STU-2024-008', name:'Meera Wagh',     class:'8',  section:'A', type:'residential', gender:'Female',  contact:'9876543217', address:'Amravati', dob:'2011-09-05', parentName:'Prakash Wagh',  bloodGroup:'O-' },
      { id:'STU-2024-009', rollNo:'STU-2024-009', name:'Sachin Pawar',   class:'10', section:'A', type:'day',         gender:'Male',   contact:'9876543218', address:'Latur', dob:'2009-12-20', parentName:'Dattatray Pawar', bloodGroup:'B+' },
      { id:'STU-2024-010', rollNo:'STU-2024-010', name:'Anjali Rao',     class:'7',  section:'A', type:'residential', gender:'Female',  contact:'9876543219', address:'Ratnagiri', dob:'2012-06-14', parentName:'Hemant Rao',    bloodGroup:'A+' }
    ]);

    console.log('🌱 Seeding Staff...');
    await Staff.insertMany([
      { id:'ST-001', name:'Mr. Ramesh Gupta',       role:'teacher', subject:'Mathematics', qualification:'M.Sc', phone:'9800001111', email:'ramesh@gurukul.in', classTeacherOf:'10-A' },
      { id:'ST-002', name:'Mrs. Sunita Deshpande',   role:'teacher', subject:'Science',     qualification:'M.Sc', phone:'9800002222', email:'sunita@gurukul.in', classTeacherOf:'9-A' },
      { id:'ST-003', name:'Mr. Anand Gokhale',      role:'warden',  subject:'—',           qualification:'B.A',  phone:'9800003333', email:'anand@gurukul.in' },
      { id:'ST-004', name:'Mrs. Lata Mehta',        role:'teacher', subject:'English',     qualification:'M.A',  phone:'9800004444', email:'lata@gurukul.in', classTeacherOf:'8-A' },
      { id:'ST-005', name:'Mr. Deepak Patil',       role:'teacher', subject:'History',     qualification:'M.A',  phone:'9800005555', email:'deepak@gurukul.in' }
    ]);

    console.log('🌱 Seeding Notices...');
    await Notice.insertMany([
      { id:'N-001', title:'Annual Sports Day 2026', content:'Annual Sports Day will be held on 15th October 2026. All students must participate.', date:'2026-09-25', priority:'high', postedBy:'admin', category:'Sports' },
      { id:'N-002', title:'Parent-Teacher Meeting (PTM)', content:'PTM scheduled for 5th October 2026 at Central Hall. Lunch arranged.', date:'2026-09-20', priority:'medium', postedBy:'principal', category:'General' },
      { id:'N-003', title:'Half-Yearly Examination Schedule', content:'Half-yearly examination schedule has been released. Check notice board.', date:'2026-09-15', priority:'high', postedBy:'principal', category:'Exams' }
    ]);

    console.log('🌱 Seeding Hostel Rooms...');
    await HostelRoom.insertMany([
      { roomNo:'H-101', floor:'1st', capacity:4, type:'boys',  students:['STU-2024-001','STU-2024-009'] },
      { roomNo:'H-102', floor:'1st', capacity:4, type:'boys',  students:['STU-2024-003','STU-2024-005'] },
      { roomNo:'H-201', floor:'2nd', capacity:4, type:'girls', students:['STU-2024-002','STU-2024-004'] },
      { roomNo:'H-202', floor:'2nd', capacity:4, type:'girls', students:['STU-2024-006','STU-2024-008'] }
    ]);

    console.log('🌱 Seeding Mess Menu...');
    await MessMenu.insertMany([
      { day: 'Monday',    breakfast: 'Poha + Tea / Milk',       lunch: 'Rice + Dal Tadka + Sabzi + Roti', snacks: 'Biscuits + Milk', dinner: 'Chapati + Sabzi + Dal Khichdi' },
      { day: 'Tuesday',   breakfast: 'Upma + Tea / Milk',       lunch: 'Rice + Rajma + Salad + Roti',     snacks: 'Sprouts + Tea',   dinner: 'Rice + Kadhi + Papad + Sabzi' },
      { day: 'Wednesday', breakfast: 'Idli Sambhar + Tea',      lunch: 'Roti + Chole + Jeera Rice',       snacks: 'Chana + Tea',     dinner: 'Pav Bhaji + Buttermilk' },
      { day: 'Thursday',  breakfast: 'Paratha + Curd',          lunch: 'Rice + Mixed Veg + Dal + Roti',   snacks: 'Poha + Tea',      dinner: 'Chapati + Paneer + Dal' },
      { day: 'Friday',    breakfast: 'Bread Butter + Milk/Tea', lunch: 'Rice + Dal Makhani + Sabzi',      snacks: 'Cream Roll + Tea',dinner: 'Chapati + Mixed Veg + Khichdi' },
      { day: 'Saturday',  breakfast: 'Thalipeeth + Curd',       lunch: 'Bhakri + Kolhapuri Amti + Rice',  snacks: 'Chikki + Milk',   dinner: 'Dal Khichdi with Pure Ghee' },
      { day: 'Sunday',    breakfast: 'Puri Bhaji + Saffron Milk',lunch: 'Puran Poli Mahaprasad Feast',    snacks: 'Fruits + Milk',   dinner: 'Light Veg Soup + Phulkas' },
    ]);

    console.log('🌱 Seeding Medical Records...');
    await Medical.insertMany([
      { id: 'MED-101', studentId: 'STU-2024-001', studentName: 'Aarav Sharma', class: '10', section: 'A', date: '2026-09-27', incidentType: 'Sports Injury', severity: 'Medium', symptoms: 'Sprained left ankle during basketball', treatment: 'Cold compression, crepe bandage and rest', attendedBy: 'Dr. Suresh Rao', guardianNotified: true, status: 'Under Observation', bloodGroup: 'B+' },
      { id: 'MED-102', studentId: 'STU-2024-004', studentName: 'Sneha Kulkarni', class: '10', section: 'A', date: '2026-09-25', incidentType: 'Viral Fever', severity: 'Normal', symptoms: 'Mild fever 100°F, headache', treatment: 'Paracetamol 500mg, warm water gargles', attendedBy: 'Sister Anita', guardianNotified: true, status: 'Resolved', bloodGroup: 'O+' }
    ]);

    console.log('🌱 Seeding Expenses...');
    await Expense.insertMany([
      { id: 'EXP-101', studentId: 'STU-2024-001', studentName: 'Aarav Sharma', date: '2026-09-25', category: 'Stationery', amount: 250, txnType: 'Expense', description: 'Geometry box & drawing notebooks', receiptNo: 'BILL-4421', incharge: 'Accountant' },
      { id: 'EXP-102', studentId: 'STU-2024-001', studentName: 'Aarav Sharma', date: '2026-09-15', category: 'Deposit', amount: 2000, txnType: 'Deposit', description: 'Parent Deposit via GPay', receiptNo: 'RCP-DEP-101', incharge: 'Warden Office' }
    ]);

    console.log('🌱 Seeding Mentors...');
    await Mentor.insertMany([
      { id: 'MEN-01', name: 'Sanjay Bhosale', role: 'Senior Hostel Warden & Girls Wing Mentor', wing: 'Girls Hostel Wing (Rooms 101–205)', rooms: ['101', '102', '201', '202'], phone: '9822001101', color: '#ec4899', targetWards: 38 },
      { id: 'MEN-02', name: 'Ramesh Shinde', role: 'Residential Mentor — Junior Boys Wing', wing: 'Junior Boys Wing (Class 5–7)', rooms: ['202', '203', '301', '302'], phone: '9822001102', color: '#3b82f6', targetWards: 37 },
      { id: 'MEN-03', name: 'Suresh Jadhav', role: 'Residential Mentor — Middle Boys Wing', wing: 'Middle Boys Wing (Class 8–9)', rooms: ['303', '304', '401', '402'], phone: '9822001103', color: '#10b981', targetWards: 37 },
      { id: 'MEN-04', name: 'Deepak Kadam', role: 'Residential Mentor — Senior Boys Wing', wing: 'Senior Boys Wing (Class 9–10)', rooms: ['404', '405', '501', '502'], phone: '9822001104', color: '#8b5cf6', targetWards: 38 }
    ]);

    console.log('🌱 Seeding Teacher Leaves...');
    await TeacherLeave.insertMany([
      { id: 'TL-101', staffId: 'ST-001', staffName: 'Mr. Ramesh Gupta', leaveType: 'Casual', startDate: '2026-09-28', endDate: '2026-09-29', days: 2, reason: 'Personal work in hometown', status: 'Pending' },
      { id: 'TL-102', staffId: 'ST-002', staffName: 'Mrs. Sunita Deshpande', leaveType: 'Medical', startDate: '2026-09-25', endDate: '2026-09-26', days: 2, reason: 'Viral fever', status: 'Approved', approvedBy: 'principal', substitutes: { 'Period 3': 'Mrs. Lata Mehta' } }
    ]);

    console.log('🌱 Seeding Achievements & Sports...');
    await Achievement.insertMany([
      { id:'ACH-001', studentId:'STU-2024-001', name:'Aarav Sharma', category:'Academic', title:'District Math Olympiad - 1st Place', date:'2026-08-15', level:'District', award:'Gold Medal' },
      { id:'ACH-002', studentId:'STU-2024-002', name:'Priya Patil',  category:'Sports',   title:'State Basketball Championship', date:'2026-07-20', level:'State', award:'Silver Medal' }
    ]);

    await Sports.insertMany([
      { id:'SPT-001', name:'Gurukul Cricket XI', category:'outdoor', members:['STU-2024-001','STU-2024-003'], coach:'Mr. Ramesh (PET)', schedule:'Mon/Wed/Fri - 5 PM' },
      { id:'SPT-002', name:'Basketball Squad',   category:'outdoor', members:['STU-2024-002','STU-2024-006'], coach:'Mrs. Sunita', schedule:'Tue/Thu - 5 PM' }
    ]);

    console.log('\n🎉 MongoDB database successfully seeded with all Gurukul modules!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
