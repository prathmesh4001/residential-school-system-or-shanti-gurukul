/* ============================================================
   SHANTI GURUKUL — In-Memory Data Store
   Mirrors the localStorage DB from legacy data.js
   In production, replace with MongoDB/PostgreSQL
   ============================================================ */

import { v4 as uuidv4 } from 'uuid';
import { Student } from '../models/Student.js';
import { DEFAULT_SCHEDULE_CONFIG, generateFullSchoolTimetable, validateTimetableConflicts } from '../services/timetableScheduler.js';

/* ── Seed Data ── */
const DEMO_STUDENTS = [
  {
    "id": "STU-2024-011",
    "rollNo": "STU-2024-011",
    "name": "Omkar Shinde",
    "class": "5",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110001",
    "address": "Bachani, Kagal",
    "parentName": "Sanjay Shinde",
    "parentPhone": "9822110001",
    "parentRelation": "Father",
    "hostelRoom": "201",
    "bloodGroup": "B+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-012",
    "rollNo": "STU-2024-012",
    "name": "Tanmay Joshi",
    "class": "5",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110002",
    "address": "Bachani, Kagal",
    "parentName": "Pradeep Joshi",
    "parentPhone": "9822110002",
    "parentRelation": "Father",
    "hostelRoom": "201",
    "bloodGroup": "O+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-013",
    "rollNo": "STU-2024-013",
    "name": "Atharva Chavan",
    "class": "5",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110003",
    "address": "Bachani, Kagal",
    "parentName": "Nitin Chavan",
    "parentPhone": "9822110003",
    "parentRelation": "Father",
    "hostelRoom": "201",
    "bloodGroup": "A+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-014",
    "rollNo": "STU-2024-014",
    "name": "Yash Gaikwad",
    "class": "5",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110004",
    "address": "Bachani, Kagal",
    "parentName": "Dattatray Gaikwad",
    "parentPhone": "9822110004",
    "parentRelation": "Father",
    "hostelRoom": "201",
    "bloodGroup": "AB+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-015",
    "rollNo": "STU-2024-015",
    "name": "Samarth Pawar",
    "class": "5",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110005",
    "address": "Bachani, Kagal",
    "parentName": "Sunil Pawar",
    "parentPhone": "9822110005",
    "parentRelation": "Father",
    "hostelRoom": "202",
    "bloodGroup": "B+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-016",
    "rollNo": "STU-2024-016",
    "name": "Prathamesh More",
    "class": "5",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110006",
    "address": "Bachani, Kagal",
    "parentName": "Anand More",
    "parentPhone": "9822110006",
    "parentRelation": "Father",
    "hostelRoom": "202",
    "bloodGroup": "O+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-017",
    "rollNo": "STU-2024-017",
    "name": "Sanket Patil",
    "class": "5",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110007",
    "address": "Bachani, Kagal",
    "parentName": "Deepak Patil",
    "parentPhone": "9822110007",
    "parentRelation": "Father",
    "hostelRoom": "202",
    "bloodGroup": "A+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-018",
    "rollNo": "STU-2024-018",
    "name": "Aditya Kadam",
    "class": "5",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110008",
    "address": "Bachani, Kagal",
    "parentName": "Ramesh Kadam",
    "parentPhone": "9822110008",
    "parentRelation": "Father",
    "hostelRoom": "202",
    "bloodGroup": "AB+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-019",
    "rollNo": "STU-2024-019",
    "name": "Siddhesh Mane",
    "class": "5",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110009",
    "address": "Bachani, Kagal",
    "parentName": "Vijay Mane",
    "parentPhone": "9822110009",
    "parentRelation": "Father",
    "hostelRoom": "203",
    "bloodGroup": "B+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-020",
    "rollNo": "STU-2024-020",
    "name": "Harshwardhan Bhosale",
    "class": "5",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110010",
    "address": "Bachani, Kagal",
    "parentName": "Rajendra Bhosale",
    "parentPhone": "9822110010",
    "parentRelation": "Father",
    "hostelRoom": "203",
    "bloodGroup": "O+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-021",
    "rollNo": "STU-2024-021",
    "name": "Sakshi Jadhav",
    "class": "5",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220001",
    "address": "Bachani / Kagal Town",
    "parentName": "Santosh Jadhav",
    "parentPhone": "9822220001",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "O+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-022",
    "rollNo": "STU-2024-022",
    "name": "Rutuja Deshmukh",
    "class": "5",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220002",
    "address": "Bachani / Kagal Town",
    "parentName": "Sanjay Deshmukh",
    "parentPhone": "9822220002",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "B+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-023",
    "rollNo": "STU-2024-023",
    "name": "Pooja Bhosale",
    "class": "5",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220003",
    "address": "Bachani / Kagal Town",
    "parentName": "Pravin Bhosale",
    "parentPhone": "9822220003",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "A+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-024",
    "rollNo": "STU-2024-024",
    "name": "Isha Salunkhe",
    "class": "5",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220004",
    "address": "Bachani / Kagal Town",
    "parentName": "Sunil Salunkhe",
    "parentPhone": "9822220004",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "AB+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-025",
    "rollNo": "STU-2024-025",
    "name": "Sayali Koli",
    "class": "5",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220005",
    "address": "Bachani / Kagal Town",
    "parentName": "Suresh Koli",
    "parentPhone": "9822220005",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "O+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-026",
    "rollNo": "STU-2024-026",
    "name": "Shruti Sawant",
    "class": "5",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220006",
    "address": "Bachani / Kagal Town",
    "parentName": "Sachin Sawant",
    "parentPhone": "9822220006",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "B+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-027",
    "rollNo": "STU-2024-027",
    "name": "Neha Ghadge",
    "class": "5",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220007",
    "address": "Bachani / Kagal Town",
    "parentName": "Nitin Ghadge",
    "parentPhone": "9822220007",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "A+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-028",
    "rollNo": "STU-2024-028",
    "name": "Riya Jagtap",
    "class": "5",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220008",
    "address": "Bachani / Kagal Town",
    "parentName": "Rajesh Jagtap",
    "parentPhone": "9822220008",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "AB+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-029",
    "rollNo": "STU-2024-029",
    "name": "Tanvi Shelar",
    "class": "5",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220009",
    "address": "Bachani / Kagal Town",
    "parentName": "Tukaram Shelar",
    "parentPhone": "9822220009",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "O+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-030",
    "rollNo": "STU-2024-030",
    "name": "Pallavi Rane",
    "class": "5",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220010",
    "address": "Bachani / Kagal Town",
    "parentName": "Prashant Rane",
    "parentPhone": "9822220010",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "B+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-007",
    "rollNo": "STU-2024-007",
    "name": "Vikram Nair",
    "class": "6",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9876543216",
    "address": "Bachani, Kagal",
    "parentName": "Murali Nair",
    "parentPhone": "9876543216",
    "parentRelation": "Father",
    "hostelRoom": "203",
    "bloodGroup": "B+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-031",
    "rollNo": "STU-2024-031",
    "name": "Vedant Kulkarni",
    "class": "6",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110011",
    "address": "Bachani, Kagal",
    "parentName": "Suhas Kulkarni",
    "parentPhone": "9822110011",
    "parentRelation": "Father",
    "hostelRoom": "203",
    "bloodGroup": "O+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-032",
    "rollNo": "STU-2024-032",
    "name": "Shreyas Mane",
    "class": "6",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110012",
    "address": "Bachani, Kagal",
    "parentName": "Ashok Mane",
    "parentPhone": "9822110012",
    "parentRelation": "Father",
    "hostelRoom": "204",
    "bloodGroup": "A+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-033",
    "rollNo": "STU-2024-033",
    "name": "Aniket Shinde",
    "class": "6",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110013",
    "address": "Bachani, Kagal",
    "parentName": "Santosh Shinde",
    "parentPhone": "9822110013",
    "parentRelation": "Father",
    "hostelRoom": "204",
    "bloodGroup": "AB+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-034",
    "rollNo": "STU-2024-034",
    "name": "Harshwardhan Patil",
    "class": "6",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110014",
    "address": "Bachani, Kagal",
    "parentName": "Bhagwan Patil",
    "parentPhone": "9822110014",
    "parentRelation": "Father",
    "hostelRoom": "204",
    "bloodGroup": "B+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-035",
    "rollNo": "STU-2024-035",
    "name": "Swaraj Bhosale",
    "class": "6",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110015",
    "address": "Bachani, Kagal",
    "parentName": "Sambhajirao Bhosale",
    "parentPhone": "9822110015",
    "parentRelation": "Father",
    "hostelRoom": "204",
    "bloodGroup": "O+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-036",
    "rollNo": "STU-2024-036",
    "name": "Parth Deshmukh",
    "class": "6",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110016",
    "address": "Bachani, Kagal",
    "parentName": "Ganesh Deshmukh",
    "parentPhone": "9822110016",
    "parentRelation": "Father",
    "hostelRoom": "205",
    "bloodGroup": "A+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-037",
    "rollNo": "STU-2024-037",
    "name": "Tejas Jadhav",
    "class": "6",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110017",
    "address": "Bachani, Kagal",
    "parentName": "Hanumant Jadhav",
    "parentPhone": "9822110017",
    "parentRelation": "Father",
    "hostelRoom": "205",
    "bloodGroup": "AB+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-038",
    "rollNo": "STU-2024-038",
    "name": "Mayur Kamble",
    "class": "6",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110018",
    "address": "Bachani, Kagal",
    "parentName": "Raju Kamble",
    "parentPhone": "9822110018",
    "parentRelation": "Father",
    "hostelRoom": "205",
    "bloodGroup": "B+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-039",
    "rollNo": "STU-2024-039",
    "name": "Soham Salunkhe",
    "class": "6",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110019",
    "address": "Bachani, Kagal",
    "parentName": "Babasaheb Salunkhe",
    "parentPhone": "9822110019",
    "parentRelation": "Father",
    "hostelRoom": "205",
    "bloodGroup": "O+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-040",
    "rollNo": "STU-2024-040",
    "name": "Samiksha Patil",
    "class": "6",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220011",
    "address": "Bachani / Kagal Town",
    "parentName": "Sambhajirao Patil",
    "parentPhone": "9822220011",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "O+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-041",
    "rollNo": "STU-2024-041",
    "name": "Shreya Kadam",
    "class": "6",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220012",
    "address": "Bachani / Kagal Town",
    "parentName": "Sharad Kadam",
    "parentPhone": "9822220012",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "B+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-042",
    "rollNo": "STU-2024-042",
    "name": "Siddhi More",
    "class": "6",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220013",
    "address": "Bachani / Kagal Town",
    "parentName": "Sitaram More",
    "parentPhone": "9822220013",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "A+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-043",
    "rollNo": "STU-2024-043",
    "name": "Akanksha Shinde",
    "class": "6",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220014",
    "address": "Bachani / Kagal Town",
    "parentName": "Anand Shinde",
    "parentPhone": "9822220014",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "AB+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-044",
    "rollNo": "STU-2024-044",
    "name": "Disha Chavan",
    "class": "6",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220015",
    "address": "Bachani / Kagal Town",
    "parentName": "Dattatray Chavan",
    "parentPhone": "9822220015",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "O+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-045",
    "rollNo": "STU-2024-045",
    "name": "Mansi Gaikwad",
    "class": "6",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220016",
    "address": "Bachani / Kagal Town",
    "parentName": "Maruti Gaikwad",
    "parentPhone": "9822220016",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "B+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-046",
    "rollNo": "STU-2024-046",
    "name": "Sanika Deshpande",
    "class": "6",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220017",
    "address": "Bachani / Kagal Town",
    "parentName": "Suhas Deshpande",
    "parentPhone": "9822220017",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "A+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-047",
    "rollNo": "STU-2024-047",
    "name": "Revati Joshi",
    "class": "6",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220018",
    "address": "Bachani / Kagal Town",
    "parentName": "Ravindra Joshi",
    "parentPhone": "9822220018",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "AB+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-048",
    "rollNo": "STU-2024-048",
    "name": "Gauri Pawar",
    "class": "6",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220019",
    "address": "Bachani / Kagal Town",
    "parentName": "Ganesh Pawar",
    "parentPhone": "9822220019",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "O+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-049",
    "rollNo": "STU-2024-049",
    "name": "Tejaswini Kamble",
    "class": "6",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220020",
    "address": "Bachani / Kagal Town",
    "parentName": "Tanaji Kamble",
    "parentPhone": "9822220020",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "B+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-005",
    "rollNo": "STU-2024-005",
    "name": "Arjun Joshi",
    "class": "7",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9876543214",
    "address": "Bachani, Kagal",
    "parentName": "Sudhir Joshi",
    "parentPhone": "9876543214",
    "parentRelation": "Father",
    "hostelRoom": "206",
    "bloodGroup": "B+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-050",
    "rollNo": "STU-2024-050",
    "name": "Aryan Joshi",
    "class": "7",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110021",
    "address": "Bachani, Kagal",
    "parentName": "Ravindra Joshi",
    "parentPhone": "9822110021",
    "parentRelation": "Father",
    "hostelRoom": "206",
    "bloodGroup": "O+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-051",
    "rollNo": "STU-2024-051",
    "name": "Sahil Jagtap",
    "class": "7",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110022",
    "address": "Bachani, Kagal",
    "parentName": "Kiran Jagtap",
    "parentPhone": "9822110022",
    "parentRelation": "Father",
    "hostelRoom": "206",
    "bloodGroup": "A+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-052",
    "rollNo": "STU-2024-052",
    "name": "Shubham Ghadge",
    "class": "7",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110023",
    "address": "Bachani, Kagal",
    "parentName": "Maruti Ghadge",
    "parentPhone": "9822110023",
    "parentRelation": "Father",
    "hostelRoom": "206",
    "bloodGroup": "AB+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-053",
    "rollNo": "STU-2024-053",
    "name": "Rohit Sawant",
    "class": "7",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110024",
    "address": "Bachani, Kagal",
    "parentName": "Balasaheb Sawant",
    "parentPhone": "9822110024",
    "parentRelation": "Father",
    "hostelRoom": "207",
    "bloodGroup": "B+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-054",
    "rollNo": "STU-2024-054",
    "name": "Pranav Mohite",
    "class": "7",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110025",
    "address": "Bachani, Kagal",
    "parentName": "Dinkar Mohite",
    "parentPhone": "9822110025",
    "parentRelation": "Father",
    "hostelRoom": "207",
    "bloodGroup": "O+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-055",
    "rollNo": "STU-2024-055",
    "name": "Kunal Thorat",
    "class": "7",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110026",
    "address": "Bachani, Kagal",
    "parentName": "Pandurang Thorat",
    "parentPhone": "9822110026",
    "parentRelation": "Father",
    "hostelRoom": "207",
    "bloodGroup": "A+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-056",
    "rollNo": "STU-2024-056",
    "name": "Suyash Rane",
    "class": "7",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110027",
    "address": "Bachani, Kagal",
    "parentName": "Vilas Rane",
    "parentPhone": "9822110027",
    "parentRelation": "Father",
    "hostelRoom": "207",
    "bloodGroup": "AB+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-057",
    "rollNo": "STU-2024-057",
    "name": "Vivek Shelar",
    "class": "7",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110028",
    "address": "Bachani, Kagal",
    "parentName": "Sharad Shelar",
    "parentPhone": "9822110028",
    "parentRelation": "Father",
    "hostelRoom": "208",
    "bloodGroup": "B+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-058",
    "rollNo": "STU-2024-058",
    "name": "Tushar Nalawade",
    "class": "7",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110029",
    "address": "Bachani, Kagal",
    "parentName": "Shivaji Nalawade",
    "parentPhone": "9822110029",
    "parentRelation": "Father",
    "hostelRoom": "208",
    "bloodGroup": "O+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-010",
    "rollNo": "STU-2024-010",
    "name": "Anjali Rao",
    "class": "7",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9876543219",
    "address": "Bachani / Kagal Town",
    "parentName": "Manohar Rao",
    "parentPhone": "9876543219",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "O+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-059",
    "rollNo": "STU-2024-059",
    "name": "Snehal Patil",
    "class": "7",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220021",
    "address": "Bachani / Kagal Town",
    "parentName": "Shrikant Patil",
    "parentPhone": "9822220021",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "B+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-060",
    "rollNo": "STU-2024-060",
    "name": "Payal Jadhav",
    "class": "7",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220022",
    "address": "Bachani / Kagal Town",
    "parentName": "Pandurang Jadhav",
    "parentPhone": "9822220022",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "A+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-061",
    "rollNo": "STU-2024-061",
    "name": "Manasi Bhosale",
    "class": "7",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220023",
    "address": "Bachani / Kagal Town",
    "parentName": "Mohan Bhosale",
    "parentPhone": "9822220023",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "AB+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-062",
    "rollNo": "STU-2024-062",
    "name": "Prajakta Deshmukh",
    "class": "7",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220024",
    "address": "Bachani / Kagal Town",
    "parentName": "Pradeep Deshmukh",
    "parentPhone": "9822220024",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "O+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-063",
    "rollNo": "STU-2024-063",
    "name": "Aarti Shinde",
    "class": "7",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220025",
    "address": "Bachani / Kagal Town",
    "parentName": "Arun Shinde",
    "parentPhone": "9822220025",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "B+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-064",
    "rollNo": "STU-2024-064",
    "name": "Divya Kulkarni",
    "class": "7",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220026",
    "address": "Bachani / Kagal Town",
    "parentName": "Dhananjay Kulkarni",
    "parentPhone": "9822220026",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "A+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-065",
    "rollNo": "STU-2024-065",
    "name": "Nikita Mane",
    "class": "7",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220027",
    "address": "Bachani / Kagal Town",
    "parentName": "Nivruti Mane",
    "parentPhone": "9822220027",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "AB+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-066",
    "rollNo": "STU-2024-066",
    "name": "Pratiksha Gaikwad",
    "class": "7",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220028",
    "address": "Bachani / Kagal Town",
    "parentName": "Prashant Gaikwad",
    "parentPhone": "9822220028",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "O+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-067",
    "rollNo": "STU-2024-067",
    "name": "Komal Pawar",
    "class": "7",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220029",
    "address": "Bachani / Kagal Town",
    "parentName": "Kishor Pawar",
    "parentPhone": "9822220029",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "B+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-003",
    "rollNo": "STU-2024-003",
    "name": "Rohan Desai",
    "class": "8",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9876543212",
    "address": "Bachani, Kagal",
    "parentName": "Vasant Desai",
    "parentPhone": "9876543212",
    "parentRelation": "Father",
    "hostelRoom": "208",
    "bloodGroup": "B+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-068",
    "rollNo": "STU-2024-068",
    "name": "Chinmay Kadam",
    "class": "8",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110031",
    "address": "Bachani, Kagal",
    "parentName": "Subhash Kadam",
    "parentPhone": "9822110031",
    "parentRelation": "Father",
    "hostelRoom": "208",
    "bloodGroup": "O+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-069",
    "rollNo": "STU-2024-069",
    "name": "Rushikesh Shinde",
    "class": "8",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110032",
    "address": "Bachani, Kagal",
    "parentName": "Popat Shinde",
    "parentPhone": "9822110032",
    "parentRelation": "Father",
    "hostelRoom": "209",
    "bloodGroup": "A+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-070",
    "rollNo": "STU-2024-070",
    "name": "Abhay Patil",
    "class": "8",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110033",
    "address": "Bachani, Kagal",
    "parentName": "Chandrakant Patil",
    "parentPhone": "9822110033",
    "parentRelation": "Father",
    "hostelRoom": "209",
    "bloodGroup": "AB+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-071",
    "rollNo": "STU-2024-071",
    "name": "Vaibhav Deshpande",
    "class": "8",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110034",
    "address": "Bachani, Kagal",
    "parentName": "Madhav Deshpande",
    "parentPhone": "9822110034",
    "parentRelation": "Father",
    "hostelRoom": "209",
    "bloodGroup": "B+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-072",
    "rollNo": "STU-2024-072",
    "name": "Siddhesh Gaikwad",
    "class": "8",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110035",
    "address": "Bachani, Kagal",
    "parentName": "Uttam Gaikwad",
    "parentPhone": "9822110035",
    "parentRelation": "Father",
    "hostelRoom": "209",
    "bloodGroup": "O+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-073",
    "rollNo": "STU-2024-073",
    "name": "Kaustubh Chavan",
    "class": "8",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110036",
    "address": "Bachani, Kagal",
    "parentName": "Arun Chavan",
    "parentPhone": "9822110036",
    "parentRelation": "Father",
    "hostelRoom": "210",
    "bloodGroup": "A+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-074",
    "rollNo": "STU-2024-074",
    "name": "Gaurav More",
    "class": "8",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110037",
    "address": "Bachani, Kagal",
    "parentName": "Jagannath More",
    "parentPhone": "9822110037",
    "parentRelation": "Father",
    "hostelRoom": "210",
    "bloodGroup": "AB+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-075",
    "rollNo": "STU-2024-075",
    "name": "Pradeep Pawar",
    "class": "8",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110038",
    "address": "Bachani, Kagal",
    "parentName": "Shankar Pawar",
    "parentPhone": "9822110038",
    "parentRelation": "Father",
    "hostelRoom": "210",
    "bloodGroup": "B+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-076",
    "rollNo": "STU-2024-076",
    "name": "Nishant Kamble",
    "class": "8",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110039",
    "address": "Bachani, Kagal",
    "parentName": "Bhimrao Kamble",
    "parentPhone": "9822110039",
    "parentRelation": "Father",
    "hostelRoom": "210",
    "bloodGroup": "O+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-008",
    "rollNo": "STU-2024-008",
    "name": "Meera Wagh",
    "class": "8",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9876543217",
    "address": "Bachani / Kagal Town",
    "parentName": "Murlidhar Wagh",
    "parentPhone": "9876543217",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "O+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-077",
    "rollNo": "STU-2024-077",
    "name": "Bhagyashree Patil",
    "class": "8",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220031",
    "address": "Bachani / Kagal Town",
    "parentName": "Baburao Patil",
    "parentPhone": "9822220031",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "B+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-078",
    "rollNo": "STU-2024-078",
    "name": "Sharvari Kadam",
    "class": "8",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220032",
    "address": "Bachani / Kagal Town",
    "parentName": "Shashikant Kadam",
    "parentPhone": "9822220032",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "A+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-079",
    "rollNo": "STU-2024-079",
    "name": "Mrunali Shinde",
    "class": "8",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220033",
    "address": "Bachani / Kagal Town",
    "parentName": "Mukund Shinde",
    "parentPhone": "9822220033",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "AB+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-080",
    "rollNo": "STU-2024-080",
    "name": "Harshada Chavan",
    "class": "8",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220034",
    "address": "Bachani / Kagal Town",
    "parentName": "Hanumant Chavan",
    "parentPhone": "9822220034",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "O+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-081",
    "rollNo": "STU-2024-081",
    "name": "Deepali More",
    "class": "8",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220035",
    "address": "Bachani / Kagal Town",
    "parentName": "Dinkar More",
    "parentPhone": "9822220035",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "B+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-082",
    "rollNo": "STU-2024-082",
    "name": "Sonali Gaikwad",
    "class": "8",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220036",
    "address": "Bachani / Kagal Town",
    "parentName": "Subhash Gaikwad",
    "parentPhone": "9822220036",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "A+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-083",
    "rollNo": "STU-2024-083",
    "name": "Radhika Deshpande",
    "class": "8",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220037",
    "address": "Bachani / Kagal Town",
    "parentName": "Ramakant Deshpande",
    "parentPhone": "9822220037",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "AB+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-084",
    "rollNo": "STU-2024-084",
    "name": "Kalyani Joshi",
    "class": "8",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220038",
    "address": "Bachani / Kagal Town",
    "parentName": "Krushna Joshi",
    "parentPhone": "9822220038",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "O+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-085",
    "rollNo": "STU-2024-085",
    "name": "Ashwini Pawar",
    "class": "8",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220039",
    "address": "Bachani / Kagal Town",
    "parentName": "Anant Pawar",
    "parentPhone": "9822220039",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "B+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-086",
    "rollNo": "STU-2024-086",
    "name": "Shourya Patil",
    "class": "9",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110041",
    "address": "Bachani, Kagal",
    "parentName": "Dilip Patil",
    "parentPhone": "9822110041",
    "parentRelation": "Father",
    "hostelRoom": "211",
    "bloodGroup": "B+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-087",
    "rollNo": "STU-2024-087",
    "name": "Rajvardhan Jadhav",
    "class": "9",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110042",
    "address": "Bachani, Kagal",
    "parentName": "Bapurao Jadhav",
    "parentPhone": "9822110042",
    "parentRelation": "Father",
    "hostelRoom": "211",
    "bloodGroup": "O+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-088",
    "rollNo": "STU-2024-088",
    "name": "Nilesh Kulkarni",
    "class": "9",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110043",
    "address": "Bachani, Kagal",
    "parentName": "Purushottam Kulkarni",
    "parentPhone": "9822110043",
    "parentRelation": "Father",
    "hostelRoom": "211",
    "bloodGroup": "A+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-089",
    "rollNo": "STU-2024-089",
    "name": "Saurabh Mane",
    "class": "9",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110044",
    "address": "Bachani, Kagal",
    "parentName": "Ramchandra Mane",
    "parentPhone": "9822110044",
    "parentRelation": "Father",
    "hostelRoom": "211",
    "bloodGroup": "AB+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-090",
    "rollNo": "STU-2024-090",
    "name": "Akshay Bhosale",
    "class": "9",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110045",
    "address": "Bachani, Kagal",
    "parentName": "Jaywant Bhosale",
    "parentPhone": "9822110045",
    "parentRelation": "Father",
    "hostelRoom": "212",
    "bloodGroup": "B+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-091",
    "rollNo": "STU-2024-091",
    "name": "Harshal Shinde",
    "class": "9",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110046",
    "address": "Bachani, Kagal",
    "parentName": "Tanaji Shinde",
    "parentPhone": "9822110046",
    "parentRelation": "Father",
    "hostelRoom": "212",
    "bloodGroup": "O+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-092",
    "rollNo": "STU-2024-092",
    "name": "Mayuresh Deshmukh",
    "class": "9",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110047",
    "address": "Bachani, Kagal",
    "parentName": "Vishwas Deshmukh",
    "parentPhone": "9822110047",
    "parentRelation": "Father",
    "hostelRoom": "212",
    "bloodGroup": "A+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-093",
    "rollNo": "STU-2024-093",
    "name": "Alok Joshi",
    "class": "9",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110048",
    "address": "Bachani, Kagal",
    "parentName": "Gajanan Joshi",
    "parentPhone": "9822110048",
    "parentRelation": "Father",
    "hostelRoom": "212",
    "bloodGroup": "AB+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-094",
    "rollNo": "STU-2024-094",
    "name": "Ritesh Gaikwad",
    "class": "9",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110049",
    "address": "Bachani, Kagal",
    "parentName": "Pandit Gaikwad",
    "parentPhone": "9822110049",
    "parentRelation": "Father",
    "hostelRoom": "213",
    "bloodGroup": "B+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-095",
    "rollNo": "STU-2024-095",
    "name": "Kiran Pawar",
    "class": "9",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110050",
    "address": "Bachani, Kagal",
    "parentName": "Prakash Pawar",
    "parentPhone": "9822110050",
    "parentRelation": "Father",
    "hostelRoom": "213",
    "bloodGroup": "O+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-002",
    "rollNo": "STU-2024-002",
    "name": "Priya Patil",
    "class": "9",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9876543211",
    "address": "Bachani / Kagal Town",
    "parentName": "Sunil Patil",
    "parentPhone": "9876543211",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "O+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-006",
    "rollNo": "STU-2024-006",
    "name": "Kavya Shinde",
    "class": "9",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9876543215",
    "address": "Bachani / Kagal Town",
    "parentName": "Kailas Shinde",
    "parentPhone": "9876543215",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "B+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-096",
    "rollNo": "STU-2024-096",
    "name": "Vaishnavi Jadhav",
    "class": "9",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220041",
    "address": "Bachani / Kagal Town",
    "parentName": "Vijay Jadhav",
    "parentPhone": "9822220041",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "A+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-097",
    "rollNo": "STU-2024-097",
    "name": "Madhuri Bhosale",
    "class": "9",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220042",
    "address": "Bachani / Kagal Town",
    "parentName": "Mahadev Bhosale",
    "parentPhone": "9822220042",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "AB+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-098",
    "rollNo": "STU-2024-098",
    "name": "Ruchita Deshmukh",
    "class": "9",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220043",
    "address": "Bachani / Kagal Town",
    "parentName": "Rajendra Deshmukh",
    "parentPhone": "9822220043",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "O+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-099",
    "rollNo": "STU-2024-099",
    "name": "Namrata Kulkarni",
    "class": "9",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220044",
    "address": "Bachani / Kagal Town",
    "parentName": "Narayan Kulkarni",
    "parentPhone": "9822220044",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "B+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-100",
    "rollNo": "STU-2024-100",
    "name": "Pranali Mane",
    "class": "9",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220045",
    "address": "Bachani / Kagal Town",
    "parentName": "Prakash Mane",
    "parentPhone": "9822220045",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "A+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-101",
    "rollNo": "STU-2024-101",
    "name": "Swati Gaikwad",
    "class": "9",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220046",
    "address": "Bachani / Kagal Town",
    "parentName": "Sanjay Gaikwad",
    "parentPhone": "9822220046",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "AB+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-102",
    "rollNo": "STU-2024-102",
    "name": "Sonal Pawar",
    "class": "9",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220047",
    "address": "Bachani / Kagal Town",
    "parentName": "Santosh Pawar",
    "parentPhone": "9822220047",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "O+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-103",
    "rollNo": "STU-2024-103",
    "name": "Asmita Salunkhe",
    "class": "9",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220048",
    "address": "Bachani / Kagal Town",
    "parentName": "Ashok Salunkhe",
    "parentPhone": "9822220048",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "B+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-001",
    "rollNo": "STU-2024-001",
    "name": "Aarav Sharma",
    "class": "10",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9876543210",
    "address": "Bachani, Kagal",
    "parentName": "Rajesh Sharma",
    "parentPhone": "9876543210",
    "parentRelation": "Father",
    "hostelRoom": "213",
    "bloodGroup": "B+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-009",
    "rollNo": "STU-2024-009",
    "name": "Sachin Pawar",
    "class": "10",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9876543218",
    "address": "Bachani, Kagal",
    "parentName": "Namdeo Pawar",
    "parentPhone": "9876543218",
    "parentRelation": "Father",
    "hostelRoom": "213",
    "bloodGroup": "O+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-104",
    "rollNo": "STU-2024-104",
    "name": "Devendra Patil",
    "class": "10",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110051",
    "address": "Bachani, Kagal",
    "parentName": "Anandrao Patil",
    "parentPhone": "9822110051",
    "parentRelation": "Father",
    "hostelRoom": "214",
    "bloodGroup": "A+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-105",
    "rollNo": "STU-2024-105",
    "name": "Vicky Shinde",
    "class": "10",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110052",
    "address": "Bachani, Kagal",
    "parentName": "Mahadev Shinde",
    "parentPhone": "9822110052",
    "parentRelation": "Father",
    "hostelRoom": "214",
    "bloodGroup": "AB+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-106",
    "rollNo": "STU-2024-106",
    "name": "Amit Gaikwad",
    "class": "10",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110053",
    "address": "Bachani, Kagal",
    "parentName": "Narayan Gaikwad",
    "parentPhone": "9822110053",
    "parentRelation": "Father",
    "hostelRoom": "214",
    "bloodGroup": "B+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-107",
    "rollNo": "STU-2024-107",
    "name": "Nikhil Bhosale",
    "class": "10",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110054",
    "address": "Bachani, Kagal",
    "parentName": "Suryakant Bhosale",
    "parentPhone": "9822110054",
    "parentRelation": "Father",
    "hostelRoom": "214",
    "bloodGroup": "O+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-108",
    "rollNo": "STU-2024-108",
    "name": "Sumit Jadhav",
    "class": "10",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110055",
    "address": "Bachani, Kagal",
    "parentName": "Tukaram Jadhav",
    "parentPhone": "9822110055",
    "parentRelation": "Father",
    "hostelRoom": "215",
    "bloodGroup": "A+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-109",
    "rollNo": "STU-2024-109",
    "name": "Sandeep Deshpande",
    "class": "10",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110056",
    "address": "Bachani, Kagal",
    "parentName": "Vinayak Deshpande",
    "parentPhone": "9822110056",
    "parentRelation": "Father",
    "hostelRoom": "215",
    "bloodGroup": "AB+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-110",
    "rollNo": "STU-2024-110",
    "name": "Ganesh More",
    "class": "10",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110057",
    "address": "Bachani, Kagal",
    "parentName": "Sitaram More",
    "parentPhone": "9822110057",
    "parentRelation": "Father",
    "hostelRoom": "215",
    "bloodGroup": "B+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-111",
    "rollNo": "STU-2024-111",
    "name": "Mahesh Kadam",
    "class": "10",
    "section": "A",
    "type": "residential",
    "gender": "Male",
    "contact": "9822110058",
    "address": "Bachani, Kagal",
    "parentName": "Bhalchandra Kadam",
    "parentPhone": "9822110058",
    "parentRelation": "Father",
    "hostelRoom": "215",
    "bloodGroup": "O+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-004",
    "rollNo": "STU-2024-004",
    "name": "Sneha Kulkarni",
    "class": "10",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9876543213",
    "address": "Bachani / Kagal Town",
    "parentName": "Mahesh Kulkarni",
    "parentPhone": "9876543213",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "O+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-112",
    "rollNo": "STU-2024-112",
    "name": "Rupali Patil",
    "class": "10",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220051",
    "address": "Bachani / Kagal Town",
    "parentName": "Ramdas Patil",
    "parentPhone": "9822220051",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "B+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-113",
    "rollNo": "STU-2024-113",
    "name": "Madhura Kadam",
    "class": "10",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220052",
    "address": "Bachani / Kagal Town",
    "parentName": "Mohan Kadam",
    "parentPhone": "9822220052",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "A+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-114",
    "rollNo": "STU-2024-114",
    "name": "Mayuri Shinde",
    "class": "10",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220053",
    "address": "Bachani / Kagal Town",
    "parentName": "Milind Shinde",
    "parentPhone": "9822220053",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "AB+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-115",
    "rollNo": "STU-2024-115",
    "name": "Jagruti Chavan",
    "class": "10",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220054",
    "address": "Bachani / Kagal Town",
    "parentName": "Jayant Chavan",
    "parentPhone": "9822220054",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "O+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-116",
    "rollNo": "STU-2024-116",
    "name": "Dhanashree More",
    "class": "10",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220055",
    "address": "Bachani / Kagal Town",
    "parentName": "Dnyaneshwar More",
    "parentPhone": "9822220055",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "B+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-117",
    "rollNo": "STU-2024-117",
    "name": "Pranita Gaikwad",
    "class": "10",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220056",
    "address": "Bachani / Kagal Town",
    "parentName": "Prabhakar Gaikwad",
    "parentPhone": "9822220056",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "A+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-118",
    "rollNo": "STU-2024-118",
    "name": "Gayatri Deshpande",
    "class": "10",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220057",
    "address": "Bachani / Kagal Town",
    "parentName": "Govind Deshpande",
    "parentPhone": "9822220057",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "AB+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-119",
    "rollNo": "STU-2024-119",
    "name": "Rohini Joshi",
    "class": "10",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220058",
    "address": "Bachani / Kagal Town",
    "parentName": "Ramchandra Joshi",
    "parentPhone": "9822220058",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "O+",
    "createdAt": "2024-01-01"
  },
  {
    "id": "STU-2024-120",
    "rollNo": "STU-2024-120",
    "name": "Seema Pawar",
    "class": "10",
    "section": "A",
    "type": "day",
    "gender": "Female",
    "contact": "9822220059",
    "address": "Bachani / Kagal Town",
    "parentName": "Sharad Pawar",
    "parentPhone": "9822220059",
    "parentRelation": "Father",
    "hostelRoom": null,
    "bloodGroup": "B+",
    "createdAt": "2024-01-01"
  }
];

const DEMO_STAFF = [
  { id: 'ST-001', name: 'Mr. Ramesh Gupta', role: 'teacher', subject: 'Mathematics', classTeacherOf: '10-A', qualification: 'M.Sc, B.Ed', phone: '9800001111', email: 'ramesh@gurukul.in', joinDate: '2020-06-01' },
  { id: 'ST-002', name: 'Mrs. Sunita Deshpande', role: 'teacher', subject: 'Science', classTeacherOf: '9-A', qualification: 'M.Sc, B.Ed', phone: '9800002222', email: 'sunita@gurukul.in', joinDate: '2019-04-01' },
  { id: 'ST-003', name: 'Mr. Sachin Patil', role: 'teacher', subject: 'Library & Co-Curricular', classTeacherOf: '', qualification: 'M.A, B.Ed', phone: '9800003333', email: 'sachin@gurukul.in', joinDate: '2021-08-01' },
  { id: 'ST-004', name: 'Mrs. Lata Mehta', role: 'teacher', subject: 'English', classTeacherOf: '8-A', qualification: 'M.A, B.Ed', phone: '9800004444', email: 'lata@gurukul.in', joinDate: '2018-06-01' },
  { id: 'ST-005', name: 'Mr. Deepak Patil', role: 'teacher', subject: 'History', classTeacherOf: '7-A', qualification: 'M.A, B.Ed', phone: '9800005555', email: 'deepak@gurukul.in', joinDate: '2022-01-01' },
  { id: 'ST-006', name: 'Mr. Prakash Kulkarni', role: 'teacher', subject: 'Marathi', classTeacherOf: '6-A', qualification: 'M.A, B.Ed', phone: '9800006666', email: 'prakash@gurukul.in', joinDate: '2020-07-15' },
  { id: 'ST-007', name: 'Mrs. Vandana Sharma', role: 'teacher', subject: 'Hindi', classTeacherOf: '5-A', qualification: 'M.A, B.Ed', phone: '9800007777', email: 'vandana@gurukul.in', joinDate: '2021-06-10' },
  { id: 'ST-008', name: 'Mr. Santosh Chavan', role: 'teacher', subject: 'Geography', classTeacherOf: '', qualification: 'M.A, B.Ed', phone: '9800008888', email: 'santosh@gurukul.in', joinDate: '2022-04-01' },
  { id: 'ST-009', name: 'Mr. Nitin Kamble', role: 'teacher', subject: 'Algebra', classTeacherOf: '', qualification: 'M.Sc, B.Ed', phone: '9800009999', email: 'nitin@gurukul.in', joinDate: '2021-09-01' },
  { id: 'ST-010', name: 'Mrs. Pooja Salunkhe', role: 'teacher', subject: 'Geometry', classTeacherOf: '', qualification: 'M.Sc, B.Ed', phone: '9800010000', email: 'pooja@gurukul.in', joinDate: '2022-08-15' },
  { id: 'ST-011', name: 'Mr. Vikram Shinde', role: 'teacher', subject: 'Physical Education', classTeacherOf: '', qualification: 'B.P.Ed', phone: '9800011111', email: 'vikram@gurukul.in', joinDate: '2020-01-10' },
  { id: 'ST-012', name: 'Mr. Dnyaneshwar More', role: 'peon', subject: '—', classTeacherOf: '', qualification: '10th Pass', phone: '9800012222', email: 'dnyaneshwar@gurukul.in', joinDate: '2018-03-01' },
  { id: 'ST-013', name: 'Mr. Babanrao Gaikwad', role: 'peon', subject: '—', classTeacherOf: '', qualification: '10th Pass', phone: '9800013333', email: 'baban@gurukul.in', joinDate: '2019-02-15' }
];

const DEMO_NOTICES = [
  { id: 'N-001', title: 'Annual Sports Day', content: 'Annual Sports Day will be held on 15th October 2024. All students must participate.', date: '2024-09-25', priority: 'high', postedBy: 'admin', category: 'Sports' },
  { id: 'N-002', title: 'Parent-Teacher Meeting', content: 'PTM scheduled for 5th October 2024. Parents are requested to attend.', date: '2024-09-20', priority: 'medium', postedBy: 'principal', category: 'General' },
  { id: 'N-003', title: 'Exam Schedule Released', content: 'Half-yearly examination schedule has been released. Check notice board.', date: '2024-09-15', priority: 'high', postedBy: 'principal', category: 'Exams' },
];

const DEMO_HOSTEL_ROOMS = [
  {
    "roomNo": "201",
    "floor": "1st",
    "capacity": 4,
    "type": "boys",
    "students": [
      "STU-2024-011",
      "STU-2024-012",
      "STU-2024-013",
      "STU-2024-014"
    ]
  },
  {
    "roomNo": "202",
    "floor": "1st",
    "capacity": 4,
    "type": "boys",
    "students": [
      "STU-2024-015",
      "STU-2024-016",
      "STU-2024-017",
      "STU-2024-018"
    ]
  },
  {
    "roomNo": "203",
    "floor": "1st",
    "capacity": 4,
    "type": "boys",
    "students": [
      "STU-2024-019",
      "STU-2024-020",
      "STU-2024-007",
      "STU-2024-031"
    ]
  },
  {
    "roomNo": "204",
    "floor": "1st",
    "capacity": 4,
    "type": "boys",
    "students": [
      "STU-2024-032",
      "STU-2024-033",
      "STU-2024-034",
      "STU-2024-035"
    ]
  },
  {
    "roomNo": "205",
    "floor": "2nd",
    "capacity": 4,
    "type": "boys",
    "students": [
      "STU-2024-036",
      "STU-2024-037",
      "STU-2024-038",
      "STU-2024-039"
    ]
  },
  {
    "roomNo": "206",
    "floor": "2nd",
    "capacity": 4,
    "type": "boys",
    "students": [
      "STU-2024-005",
      "STU-2024-050",
      "STU-2024-051",
      "STU-2024-052"
    ]
  },
  {
    "roomNo": "207",
    "floor": "2nd",
    "capacity": 4,
    "type": "boys",
    "students": [
      "STU-2024-053",
      "STU-2024-054",
      "STU-2024-055",
      "STU-2024-056"
    ]
  },
  {
    "roomNo": "208",
    "floor": "2nd",
    "capacity": 4,
    "type": "boys",
    "students": [
      "STU-2024-057",
      "STU-2024-058",
      "STU-2024-003",
      "STU-2024-068"
    ]
  },
  {
    "roomNo": "209",
    "floor": "3rd",
    "capacity": 4,
    "type": "boys",
    "students": [
      "STU-2024-069",
      "STU-2024-070",
      "STU-2024-071",
      "STU-2024-072"
    ]
  },
  {
    "roomNo": "210",
    "floor": "3rd",
    "capacity": 4,
    "type": "boys",
    "students": [
      "STU-2024-073",
      "STU-2024-074",
      "STU-2024-075",
      "STU-2024-076"
    ]
  },
  {
    "roomNo": "211",
    "floor": "3rd",
    "capacity": 4,
    "type": "boys",
    "students": [
      "STU-2024-086",
      "STU-2024-087",
      "STU-2024-088",
      "STU-2024-089"
    ]
  },
  {
    "roomNo": "212",
    "floor": "3rd",
    "capacity": 4,
    "type": "boys",
    "students": [
      "STU-2024-090",
      "STU-2024-091",
      "STU-2024-092",
      "STU-2024-093"
    ]
  },
  {
    "roomNo": "213",
    "floor": "4th",
    "capacity": 4,
    "type": "boys",
    "students": [
      "STU-2024-094",
      "STU-2024-095",
      "STU-2024-001",
      "STU-2024-009"
    ]
  },
  {
    "roomNo": "214",
    "floor": "4th",
    "capacity": 4,
    "type": "boys",
    "students": [
      "STU-2024-104",
      "STU-2024-105",
      "STU-2024-106",
      "STU-2024-107"
    ]
  },
  {
    "roomNo": "215",
    "floor": "4th",
    "capacity": 4,
    "type": "boys",
    "students": [
      "STU-2024-108",
      "STU-2024-109",
      "STU-2024-110",
      "STU-2024-111"
    ]
  }
];

const DEMO_FEE_STRUCTURE = {
  day: 10000,
  residential: 50000,
  categories: {
    day: {
      name: 'Day Scholar',
      annualFee: 10000,
      studentCount: 300,
      expectedTotal: 3000000,
      breakdown: { tuition: 7000, exams: 1000, library: 1000, sports: 1000 },
      inclusions: ['Academic Tuition', 'Periodic & Annual Exams', 'Library Access', 'Sports & Physical Education']
    },
    residential: {
      name: 'Residential Student',
      annualFee: 50000,
      studentCount: 150,
      expectedTotal: 7500000,
      breakdown: { tuition: 15000, hostel: 15000, mess: 14000, exams: 2000, library: 2000, sports: 2000 },
      inclusions: ['Academic Tuition', 'Hostel Accommodation', 'Nutritious Mess (3 Meals + Snacks)', 'Periodic & Annual Exams', 'Library Access', 'Sports Coaching & Fitness']
    }
  }
};

const DEMO_TIMETABLE = {
  '10_A': {
    Monday: ['Mathematics', 'English', 'Science', '—', 'History', 'Geography', 'Physical Education'],
    Tuesday: ['English', 'Mathematics', 'Hindi', '—', 'Science', 'Marathi', 'Library'],
    Wednesday: ['Science', 'Hindi', 'Mathematics', '—', 'English', 'History', 'Geography'],
    Thursday: ['Hindi', 'Science', 'English', '—', 'Mathematics', 'Marathi', 'Physical Education'],
    Friday: ['Mathematics', 'History', 'Science', '—', 'English', 'Hindi', 'Geography'],
    Saturday: ['Science', 'Physical Education', 'Marathi', '—', 'Mathematics', 'English', '—'],
  }
};

const DEMO_ACHIEVEMENTS = [
  { id: 'ACH-001', studentId: 'STU-2024-001', name: 'Aarav Sharma', category: 'Academic', title: 'District Math Olympiad - 1st Place', date: '2024-08-15', level: 'District', award: 'Gold Medal' },
  { id: 'ACH-002', studentId: 'STU-2024-002', name: 'Priya Patil', category: 'Sports', title: 'State Basketball Championship', date: '2024-07-20', level: 'State', award: 'Silver Medal' },
];

const DEMO_SPORTS = [
  { id: 'SPT-001', name: 'Cricket Team', category: 'outdoor', members: ['STU-2024-001', 'STU-2024-003'], coach: 'Mr. Ramesh', schedule: 'Mon/Wed/Fri - 5 PM' },
  { id: 'SPT-002', name: 'Basketball Team', category: 'outdoor', members: ['STU-2024-002', 'STU-2024-006'], coach: 'Mrs. Sunita', schedule: 'Tue/Thu - 5 PM' },
];

const DEMO_MESS_MENU = {
  Monday: { breakfast: 'Poha + Tea', lunch: 'Rice + Dal + Sabzi + Roti', dinner: 'Chapati + Sabzi + Dal' },
  Tuesday: { breakfast: 'Upma + Tea', lunch: 'Rice + Rajma + Salad', dinner: 'Rice + Kadhi + Papad' },
  Wednesday: { breakfast: 'Idli Sambhar + Tea', lunch: 'Roti + Chole + Rice', dinner: 'Pav Bhaji + Buttermilk' },
  Thursday: { breakfast: 'Paratha + Curd', lunch: 'Rice + Mixed Veg + Roti', dinner: 'Chapati + Paneer + Dal' },
  Friday: { breakfast: 'Bread Butter + Tea', lunch: 'Rice + Fish Curry / Dal', dinner: 'Chapati + Egg Curry / Dal' },
  Saturday: { breakfast: 'Poha + Jalebi', lunch: 'Rice + Special Veg + Kheer', dinner: 'Chapati + Dal Makhani' },
  Sunday: { breakfast: 'Puri Sabzi', lunch: 'Rice + Mutton/Paneer + Payasam', dinner: 'Chapati + Dal + Sweet' },
};

const todayStr = new Date().toISOString().slice(0, 10);
const DEMO_ATTENDANCE = [
  {
    "key": "2026-10-26_5_A_all",
    "class": "5",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "all",
    "subject": "Daily Morning Roll Call",
    "teacher": "Mrs. Vandana Sharma",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "A",
        "remark": "Unwell / Absent"
      },
      {
        "id": "STU-2024-015",
        "status": "L",
        "remark": "Sanctioned leave"
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T09:30:00.000Z"
  },
  {
    "key": "2026-10-26_5_A_period_1",
    "class": "5",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "1",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T10:00:00.000Z"
  },
  {
    "key": "2026-10-26_5_A_period_2",
    "class": "5",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "2",
    "subject": "English",
    "teacher": "Mrs. Lata Mehta",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T11:00:00.000Z"
  },
  {
    "key": "2026-10-26_5_A_period_3",
    "class": "5",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "3",
    "subject": "Hindi",
    "teacher": "Mrs. Vandana Sharma",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T12:00:00.000Z"
  },
  {
    "key": "2026-10-26_5_A_period_4",
    "class": "5",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "4",
    "subject": "Mathematics",
    "teacher": "Mr. Ramesh Gupta",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "L",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T12:00:00.000Z"
  },
  {
    "key": "2026-10-26_5_A_period_5",
    "class": "5",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "5",
    "subject": "History",
    "teacher": "Mr. Deepak Patil",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T13:00:00.000Z"
  },
  {
    "key": "2026-10-26_5_A_period_6",
    "class": "5",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "6",
    "subject": "Geography",
    "teacher": "Mr. Santosh Chavan",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T14:00:00.000Z"
  },
  {
    "key": "2026-10-26_5_A_period_7",
    "class": "5",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "7",
    "subject": "Science",
    "teacher": "Mrs. Sunita Deshpande",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T14:00:00.000Z"
  },
  {
    "key": "2026-10-26_5_A_period_8",
    "class": "5",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "8",
    "subject": "Physical Education",
    "teacher": "Mr. Vikram Shinde",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T15:00:00.000Z"
  },
  {
    "key": "2026-10-26_5_A_period_9",
    "class": "5",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "9",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T16:00:00.000Z"
  },
  {
    "key": "2026-10-26_6_A_all",
    "class": "6",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "all",
    "subject": "Daily Morning Roll Call",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "A",
        "remark": "Unwell / Absent"
      },
      {
        "id": "STU-2024-034",
        "status": "L",
        "remark": "Sanctioned leave"
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T09:30:00.000Z"
  },
  {
    "key": "2026-10-26_6_A_period_1",
    "class": "6",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "1",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T10:00:00.000Z"
  },
  {
    "key": "2026-10-26_6_A_period_2",
    "class": "6",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "2",
    "subject": "English",
    "teacher": "Mrs. Lata Mehta",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T11:00:00.000Z"
  },
  {
    "key": "2026-10-26_6_A_period_3",
    "class": "6",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "3",
    "subject": "Hindi",
    "teacher": "Mrs. Vandana Sharma",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T12:00:00.000Z"
  },
  {
    "key": "2026-10-26_6_A_period_4",
    "class": "6",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "4",
    "subject": "Mathematics",
    "teacher": "Mr. Ramesh Gupta",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "L",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T12:00:00.000Z"
  },
  {
    "key": "2026-10-26_6_A_period_5",
    "class": "6",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "5",
    "subject": "History",
    "teacher": "Mr. Deepak Patil",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T13:00:00.000Z"
  },
  {
    "key": "2026-10-26_6_A_period_6",
    "class": "6",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "6",
    "subject": "Geography",
    "teacher": "Mr. Santosh Chavan",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T14:00:00.000Z"
  },
  {
    "key": "2026-10-26_6_A_period_7",
    "class": "6",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "7",
    "subject": "Science",
    "teacher": "Mrs. Sunita Deshpande",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T14:00:00.000Z"
  },
  {
    "key": "2026-10-26_6_A_period_8",
    "class": "6",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "8",
    "subject": "Physical Education",
    "teacher": "Mr. Vikram Shinde",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T15:00:00.000Z"
  },
  {
    "key": "2026-10-26_6_A_period_9",
    "class": "6",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "9",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T16:00:00.000Z"
  },
  {
    "key": "2026-10-26_7_A_all",
    "class": "7",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "all",
    "subject": "Daily Morning Roll Call",
    "teacher": "Mr. Deepak Patil",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "A",
        "remark": "Unwell / Absent"
      },
      {
        "id": "STU-2024-053",
        "status": "L",
        "remark": "Sanctioned leave"
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T09:30:00.000Z"
  },
  {
    "key": "2026-10-26_7_A_period_1",
    "class": "7",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "1",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T10:00:00.000Z"
  },
  {
    "key": "2026-10-26_7_A_period_2",
    "class": "7",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "2",
    "subject": "English",
    "teacher": "Mrs. Lata Mehta",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T11:00:00.000Z"
  },
  {
    "key": "2026-10-26_7_A_period_3",
    "class": "7",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "3",
    "subject": "Hindi",
    "teacher": "Mrs. Vandana Sharma",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T12:00:00.000Z"
  },
  {
    "key": "2026-10-26_7_A_period_4",
    "class": "7",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "4",
    "subject": "Mathematics",
    "teacher": "Mr. Ramesh Gupta",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "L",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T12:00:00.000Z"
  },
  {
    "key": "2026-10-26_7_A_period_5",
    "class": "7",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "5",
    "subject": "History",
    "teacher": "Mr. Deepak Patil",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T13:00:00.000Z"
  },
  {
    "key": "2026-10-26_7_A_period_6",
    "class": "7",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "6",
    "subject": "Geography",
    "teacher": "Mr. Santosh Chavan",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T14:00:00.000Z"
  },
  {
    "key": "2026-10-26_7_A_period_7",
    "class": "7",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "7",
    "subject": "Science",
    "teacher": "Mrs. Sunita Deshpande",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T14:00:00.000Z"
  },
  {
    "key": "2026-10-26_7_A_period_8",
    "class": "7",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "8",
    "subject": "Physical Education",
    "teacher": "Mr. Vikram Shinde",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T15:00:00.000Z"
  },
  {
    "key": "2026-10-26_7_A_period_9",
    "class": "7",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "9",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T16:00:00.000Z"
  },
  {
    "key": "2026-10-26_8_A_all",
    "class": "8",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "all",
    "subject": "Daily Morning Roll Call",
    "teacher": "Mrs. Lata Mehta",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "A",
        "remark": "Unwell / Absent"
      },
      {
        "id": "STU-2024-071",
        "status": "L",
        "remark": "Sanctioned leave"
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T09:30:00.000Z"
  },
  {
    "key": "2026-10-26_8_A_period_1",
    "class": "8",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "1",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T10:00:00.000Z"
  },
  {
    "key": "2026-10-26_8_A_period_2",
    "class": "8",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "2",
    "subject": "English",
    "teacher": "Mrs. Lata Mehta",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T11:00:00.000Z"
  },
  {
    "key": "2026-10-26_8_A_period_3",
    "class": "8",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "3",
    "subject": "Hindi",
    "teacher": "Mrs. Vandana Sharma",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T12:00:00.000Z"
  },
  {
    "key": "2026-10-26_8_A_period_4",
    "class": "8",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "4",
    "subject": "Mathematics",
    "teacher": "Mr. Ramesh Gupta",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "L",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T12:00:00.000Z"
  },
  {
    "key": "2026-10-26_8_A_period_5",
    "class": "8",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "5",
    "subject": "History",
    "teacher": "Mr. Deepak Patil",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T13:00:00.000Z"
  },
  {
    "key": "2026-10-26_8_A_period_6",
    "class": "8",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "6",
    "subject": "Geography",
    "teacher": "Mr. Santosh Chavan",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T14:00:00.000Z"
  },
  {
    "key": "2026-10-26_8_A_period_7",
    "class": "8",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "7",
    "subject": "Science",
    "teacher": "Mrs. Sunita Deshpande",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T14:00:00.000Z"
  },
  {
    "key": "2026-10-26_8_A_period_8",
    "class": "8",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "8",
    "subject": "Physical Education",
    "teacher": "Mr. Vikram Shinde",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T15:00:00.000Z"
  },
  {
    "key": "2026-10-26_8_A_period_9",
    "class": "8",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "9",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T16:00:00.000Z"
  },
  {
    "key": "2026-10-26_9_A_all",
    "class": "9",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "all",
    "subject": "Daily Morning Roll Call",
    "teacher": "Mrs. Sunita Deshpande",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "A",
        "remark": "Unwell / Absent"
      },
      {
        "id": "STU-2024-090",
        "status": "L",
        "remark": "Sanctioned leave"
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T09:30:00.000Z"
  },
  {
    "key": "2026-10-26_9_A_period_1",
    "class": "9",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "1",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T10:00:00.000Z"
  },
  {
    "key": "2026-10-26_9_A_period_2",
    "class": "9",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "2",
    "subject": "English",
    "teacher": "Mrs. Lata Mehta",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T11:00:00.000Z"
  },
  {
    "key": "2026-10-26_9_A_period_3",
    "class": "9",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "3",
    "subject": "Hindi",
    "teacher": "Mrs. Vandana Sharma",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T12:00:00.000Z"
  },
  {
    "key": "2026-10-26_9_A_period_4",
    "class": "9",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "4",
    "subject": "Algebra",
    "teacher": "Mr. Nitin Kamble",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "L",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T12:00:00.000Z"
  },
  {
    "key": "2026-10-26_9_A_period_5",
    "class": "9",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "5",
    "subject": "Geometry",
    "teacher": "Mrs. Pooja Salunkhe",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T13:00:00.000Z"
  },
  {
    "key": "2026-10-26_9_A_period_6",
    "class": "9",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "6",
    "subject": "History",
    "teacher": "Mr. Deepak Patil",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T14:00:00.000Z"
  },
  {
    "key": "2026-10-26_9_A_period_7",
    "class": "9",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "7",
    "subject": "Geography",
    "teacher": "Mr. Santosh Chavan",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T14:00:00.000Z"
  },
  {
    "key": "2026-10-26_9_A_period_8",
    "class": "9",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "8",
    "subject": "Science",
    "teacher": "Mrs. Sunita Deshpande",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T15:00:00.000Z"
  },
  {
    "key": "2026-10-26_9_A_period_9",
    "class": "9",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "9",
    "subject": "Physical Education",
    "teacher": "Mr. Vikram Shinde",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T16:00:00.000Z"
  },
  {
    "key": "2026-10-26_10_A_all",
    "class": "10",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "all",
    "subject": "Daily Morning Roll Call",
    "teacher": "Mr. Ramesh Gupta",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "A",
        "remark": "Unwell / Absent"
      },
      {
        "id": "STU-2024-106",
        "status": "L",
        "remark": "Sanctioned leave"
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T09:30:00.000Z"
  },
  {
    "key": "2026-10-26_10_A_period_1",
    "class": "10",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "1",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T10:00:00.000Z"
  },
  {
    "key": "2026-10-26_10_A_period_2",
    "class": "10",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "2",
    "subject": "English",
    "teacher": "Mrs. Lata Mehta",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T11:00:00.000Z"
  },
  {
    "key": "2026-10-26_10_A_period_3",
    "class": "10",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "3",
    "subject": "Hindi",
    "teacher": "Mrs. Vandana Sharma",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T12:00:00.000Z"
  },
  {
    "key": "2026-10-26_10_A_period_4",
    "class": "10",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "4",
    "subject": "Algebra",
    "teacher": "Mr. Nitin Kamble",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "L",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T12:00:00.000Z"
  },
  {
    "key": "2026-10-26_10_A_period_5",
    "class": "10",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "5",
    "subject": "Geometry",
    "teacher": "Mrs. Pooja Salunkhe",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T13:00:00.000Z"
  },
  {
    "key": "2026-10-26_10_A_period_6",
    "class": "10",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "6",
    "subject": "History",
    "teacher": "Mr. Deepak Patil",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T14:00:00.000Z"
  },
  {
    "key": "2026-10-26_10_A_period_7",
    "class": "10",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "7",
    "subject": "Geography",
    "teacher": "Mr. Santosh Chavan",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T14:00:00.000Z"
  },
  {
    "key": "2026-10-26_10_A_period_8",
    "class": "10",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "8",
    "subject": "Science",
    "teacher": "Mrs. Sunita Deshpande",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T15:00:00.000Z"
  },
  {
    "key": "2026-10-26_10_A_period_9",
    "class": "10",
    "section": "A",
    "date": "2026-10-26",
    "type": "class",
    "period": "9",
    "subject": "Physical Education",
    "teacher": "Mr. Vikram Shinde",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-26T16:00:00.000Z"
  },
  {
    "key": "2026-10-27_5_A_all",
    "class": "5",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "all",
    "subject": "Daily Morning Roll Call",
    "teacher": "Mrs. Vandana Sharma",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "A",
        "remark": "Unwell / Absent"
      },
      {
        "id": "STU-2024-014",
        "status": "L",
        "remark": "Sanctioned leave"
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T09:30:00.000Z"
  },
  {
    "key": "2026-10-27_5_A_period_1",
    "class": "5",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "1",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T10:00:00.000Z"
  },
  {
    "key": "2026-10-27_5_A_period_2",
    "class": "5",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "2",
    "subject": "English",
    "teacher": "Mrs. Lata Mehta",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T11:00:00.000Z"
  },
  {
    "key": "2026-10-27_5_A_period_3",
    "class": "5",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "3",
    "subject": "Hindi",
    "teacher": "Mrs. Vandana Sharma",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T12:00:00.000Z"
  },
  {
    "key": "2026-10-27_5_A_period_4",
    "class": "5",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "4",
    "subject": "Mathematics",
    "teacher": "Mr. Ramesh Gupta",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "L",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T12:00:00.000Z"
  },
  {
    "key": "2026-10-27_5_A_period_5",
    "class": "5",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "5",
    "subject": "History",
    "teacher": "Mr. Deepak Patil",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T13:00:00.000Z"
  },
  {
    "key": "2026-10-27_5_A_period_6",
    "class": "5",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "6",
    "subject": "Geography",
    "teacher": "Mr. Santosh Chavan",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T14:00:00.000Z"
  },
  {
    "key": "2026-10-27_5_A_period_7",
    "class": "5",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "7",
    "subject": "Science",
    "teacher": "Mrs. Sunita Deshpande",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T14:00:00.000Z"
  },
  {
    "key": "2026-10-27_5_A_period_8",
    "class": "5",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "8",
    "subject": "Physical Education",
    "teacher": "Mr. Vikram Shinde",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T15:00:00.000Z"
  },
  {
    "key": "2026-10-27_5_A_period_9",
    "class": "5",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "9",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T16:00:00.000Z"
  },
  {
    "key": "2026-10-27_6_A_all",
    "class": "6",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "all",
    "subject": "Daily Morning Roll Call",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "A",
        "remark": "Unwell / Absent"
      },
      {
        "id": "STU-2024-033",
        "status": "L",
        "remark": "Sanctioned leave"
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T09:30:00.000Z"
  },
  {
    "key": "2026-10-27_6_A_period_1",
    "class": "6",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "1",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T10:00:00.000Z"
  },
  {
    "key": "2026-10-27_6_A_period_2",
    "class": "6",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "2",
    "subject": "English",
    "teacher": "Mrs. Lata Mehta",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T11:00:00.000Z"
  },
  {
    "key": "2026-10-27_6_A_period_3",
    "class": "6",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "3",
    "subject": "Hindi",
    "teacher": "Mrs. Vandana Sharma",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T12:00:00.000Z"
  },
  {
    "key": "2026-10-27_6_A_period_4",
    "class": "6",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "4",
    "subject": "Mathematics",
    "teacher": "Mr. Ramesh Gupta",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "L",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T12:00:00.000Z"
  },
  {
    "key": "2026-10-27_6_A_period_5",
    "class": "6",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "5",
    "subject": "History",
    "teacher": "Mr. Deepak Patil",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T13:00:00.000Z"
  },
  {
    "key": "2026-10-27_6_A_period_6",
    "class": "6",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "6",
    "subject": "Geography",
    "teacher": "Mr. Santosh Chavan",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T14:00:00.000Z"
  },
  {
    "key": "2026-10-27_6_A_period_7",
    "class": "6",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "7",
    "subject": "Science",
    "teacher": "Mrs. Sunita Deshpande",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T14:00:00.000Z"
  },
  {
    "key": "2026-10-27_6_A_period_8",
    "class": "6",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "8",
    "subject": "Physical Education",
    "teacher": "Mr. Vikram Shinde",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T15:00:00.000Z"
  },
  {
    "key": "2026-10-27_6_A_period_9",
    "class": "6",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "9",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T16:00:00.000Z"
  },
  {
    "key": "2026-10-27_7_A_all",
    "class": "7",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "all",
    "subject": "Daily Morning Roll Call",
    "teacher": "Mr. Deepak Patil",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "A",
        "remark": "Unwell / Absent"
      },
      {
        "id": "STU-2024-052",
        "status": "L",
        "remark": "Sanctioned leave"
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T09:30:00.000Z"
  },
  {
    "key": "2026-10-27_7_A_period_1",
    "class": "7",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "1",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T10:00:00.000Z"
  },
  {
    "key": "2026-10-27_7_A_period_2",
    "class": "7",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "2",
    "subject": "English",
    "teacher": "Mrs. Lata Mehta",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T11:00:00.000Z"
  },
  {
    "key": "2026-10-27_7_A_period_3",
    "class": "7",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "3",
    "subject": "Hindi",
    "teacher": "Mrs. Vandana Sharma",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T12:00:00.000Z"
  },
  {
    "key": "2026-10-27_7_A_period_4",
    "class": "7",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "4",
    "subject": "Mathematics",
    "teacher": "Mr. Ramesh Gupta",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "L",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T12:00:00.000Z"
  },
  {
    "key": "2026-10-27_7_A_period_5",
    "class": "7",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "5",
    "subject": "History",
    "teacher": "Mr. Deepak Patil",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T13:00:00.000Z"
  },
  {
    "key": "2026-10-27_7_A_period_6",
    "class": "7",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "6",
    "subject": "Geography",
    "teacher": "Mr. Santosh Chavan",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T14:00:00.000Z"
  },
  {
    "key": "2026-10-27_7_A_period_7",
    "class": "7",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "7",
    "subject": "Science",
    "teacher": "Mrs. Sunita Deshpande",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T14:00:00.000Z"
  },
  {
    "key": "2026-10-27_7_A_period_8",
    "class": "7",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "8",
    "subject": "Physical Education",
    "teacher": "Mr. Vikram Shinde",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T15:00:00.000Z"
  },
  {
    "key": "2026-10-27_7_A_period_9",
    "class": "7",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "9",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T16:00:00.000Z"
  },
  {
    "key": "2026-10-27_8_A_all",
    "class": "8",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "all",
    "subject": "Daily Morning Roll Call",
    "teacher": "Mrs. Lata Mehta",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "A",
        "remark": "Unwell / Absent"
      },
      {
        "id": "STU-2024-070",
        "status": "L",
        "remark": "Sanctioned leave"
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T09:30:00.000Z"
  },
  {
    "key": "2026-10-27_8_A_period_1",
    "class": "8",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "1",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T10:00:00.000Z"
  },
  {
    "key": "2026-10-27_8_A_period_2",
    "class": "8",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "2",
    "subject": "English",
    "teacher": "Mrs. Lata Mehta",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T11:00:00.000Z"
  },
  {
    "key": "2026-10-27_8_A_period_3",
    "class": "8",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "3",
    "subject": "Hindi",
    "teacher": "Mrs. Vandana Sharma",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T12:00:00.000Z"
  },
  {
    "key": "2026-10-27_8_A_period_4",
    "class": "8",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "4",
    "subject": "Mathematics",
    "teacher": "Mr. Ramesh Gupta",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "L",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T12:00:00.000Z"
  },
  {
    "key": "2026-10-27_8_A_period_5",
    "class": "8",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "5",
    "subject": "History",
    "teacher": "Mr. Deepak Patil",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T13:00:00.000Z"
  },
  {
    "key": "2026-10-27_8_A_period_6",
    "class": "8",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "6",
    "subject": "Geography",
    "teacher": "Mr. Santosh Chavan",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T14:00:00.000Z"
  },
  {
    "key": "2026-10-27_8_A_period_7",
    "class": "8",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "7",
    "subject": "Science",
    "teacher": "Mrs. Sunita Deshpande",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T14:00:00.000Z"
  },
  {
    "key": "2026-10-27_8_A_period_8",
    "class": "8",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "8",
    "subject": "Physical Education",
    "teacher": "Mr. Vikram Shinde",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T15:00:00.000Z"
  },
  {
    "key": "2026-10-27_8_A_period_9",
    "class": "8",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "9",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T16:00:00.000Z"
  },
  {
    "key": "2026-10-27_9_A_all",
    "class": "9",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "all",
    "subject": "Daily Morning Roll Call",
    "teacher": "Mrs. Sunita Deshpande",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "A",
        "remark": "Unwell / Absent"
      },
      {
        "id": "STU-2024-089",
        "status": "L",
        "remark": "Sanctioned leave"
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T09:30:00.000Z"
  },
  {
    "key": "2026-10-27_9_A_period_1",
    "class": "9",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "1",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T10:00:00.000Z"
  },
  {
    "key": "2026-10-27_9_A_period_2",
    "class": "9",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "2",
    "subject": "English",
    "teacher": "Mrs. Lata Mehta",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T11:00:00.000Z"
  },
  {
    "key": "2026-10-27_9_A_period_3",
    "class": "9",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "3",
    "subject": "Hindi",
    "teacher": "Mrs. Vandana Sharma",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T12:00:00.000Z"
  },
  {
    "key": "2026-10-27_9_A_period_4",
    "class": "9",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "4",
    "subject": "Algebra",
    "teacher": "Mr. Nitin Kamble",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "L",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T12:00:00.000Z"
  },
  {
    "key": "2026-10-27_9_A_period_5",
    "class": "9",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "5",
    "subject": "Geometry",
    "teacher": "Mrs. Pooja Salunkhe",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T13:00:00.000Z"
  },
  {
    "key": "2026-10-27_9_A_period_6",
    "class": "9",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "6",
    "subject": "History",
    "teacher": "Mr. Deepak Patil",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T14:00:00.000Z"
  },
  {
    "key": "2026-10-27_9_A_period_7",
    "class": "9",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "7",
    "subject": "Geography",
    "teacher": "Mr. Santosh Chavan",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T14:00:00.000Z"
  },
  {
    "key": "2026-10-27_9_A_period_8",
    "class": "9",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "8",
    "subject": "Science",
    "teacher": "Mrs. Sunita Deshpande",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T15:00:00.000Z"
  },
  {
    "key": "2026-10-27_9_A_period_9",
    "class": "9",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "9",
    "subject": "Physical Education",
    "teacher": "Mr. Vikram Shinde",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T16:00:00.000Z"
  },
  {
    "key": "2026-10-27_10_A_all",
    "class": "10",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "all",
    "subject": "Daily Morning Roll Call",
    "teacher": "Mr. Ramesh Gupta",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "A",
        "remark": "Unwell / Absent"
      },
      {
        "id": "STU-2024-105",
        "status": "L",
        "remark": "Sanctioned leave"
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T09:30:00.000Z"
  },
  {
    "key": "2026-10-27_10_A_period_1",
    "class": "10",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "1",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T10:00:00.000Z"
  },
  {
    "key": "2026-10-27_10_A_period_2",
    "class": "10",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "2",
    "subject": "English",
    "teacher": "Mrs. Lata Mehta",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T11:00:00.000Z"
  },
  {
    "key": "2026-10-27_10_A_period_3",
    "class": "10",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "3",
    "subject": "Hindi",
    "teacher": "Mrs. Vandana Sharma",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T12:00:00.000Z"
  },
  {
    "key": "2026-10-27_10_A_period_4",
    "class": "10",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "4",
    "subject": "Algebra",
    "teacher": "Mr. Nitin Kamble",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "L",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T12:00:00.000Z"
  },
  {
    "key": "2026-10-27_10_A_period_5",
    "class": "10",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "5",
    "subject": "Geometry",
    "teacher": "Mrs. Pooja Salunkhe",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T13:00:00.000Z"
  },
  {
    "key": "2026-10-27_10_A_period_6",
    "class": "10",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "6",
    "subject": "History",
    "teacher": "Mr. Deepak Patil",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T14:00:00.000Z"
  },
  {
    "key": "2026-10-27_10_A_period_7",
    "class": "10",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "7",
    "subject": "Geography",
    "teacher": "Mr. Santosh Chavan",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T14:00:00.000Z"
  },
  {
    "key": "2026-10-27_10_A_period_8",
    "class": "10",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "8",
    "subject": "Science",
    "teacher": "Mrs. Sunita Deshpande",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T15:00:00.000Z"
  },
  {
    "key": "2026-10-27_10_A_period_9",
    "class": "10",
    "section": "A",
    "date": "2026-10-27",
    "type": "class",
    "period": "9",
    "subject": "Physical Education",
    "teacher": "Mr. Vikram Shinde",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-27T16:00:00.000Z"
  },
  {
    "key": "2026-10-28_5_A_all",
    "class": "5",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "all",
    "subject": "Daily Morning Roll Call",
    "teacher": "Mrs. Vandana Sharma",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "A",
        "remark": "Unwell / Absent"
      },
      {
        "id": "STU-2024-013",
        "status": "L",
        "remark": "Sanctioned leave"
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T09:30:00.000Z"
  },
  {
    "key": "2026-10-28_5_A_period_1",
    "class": "5",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "1",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T10:00:00.000Z"
  },
  {
    "key": "2026-10-28_5_A_period_2",
    "class": "5",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "2",
    "subject": "English",
    "teacher": "Mrs. Lata Mehta",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T11:00:00.000Z"
  },
  {
    "key": "2026-10-28_5_A_period_3",
    "class": "5",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "3",
    "subject": "Hindi",
    "teacher": "Mrs. Vandana Sharma",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T12:00:00.000Z"
  },
  {
    "key": "2026-10-28_5_A_period_4",
    "class": "5",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "4",
    "subject": "Mathematics",
    "teacher": "Mr. Ramesh Gupta",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "L",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T12:00:00.000Z"
  },
  {
    "key": "2026-10-28_5_A_period_5",
    "class": "5",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "5",
    "subject": "History",
    "teacher": "Mr. Deepak Patil",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T13:00:00.000Z"
  },
  {
    "key": "2026-10-28_5_A_period_6",
    "class": "5",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "6",
    "subject": "Geography",
    "teacher": "Mr. Santosh Chavan",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T14:00:00.000Z"
  },
  {
    "key": "2026-10-28_5_A_period_7",
    "class": "5",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "7",
    "subject": "Science",
    "teacher": "Mrs. Sunita Deshpande",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T14:00:00.000Z"
  },
  {
    "key": "2026-10-28_5_A_period_8",
    "class": "5",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "8",
    "subject": "Physical Education",
    "teacher": "Mr. Vikram Shinde",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T15:00:00.000Z"
  },
  {
    "key": "2026-10-28_5_A_period_9",
    "class": "5",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "9",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T16:00:00.000Z"
  },
  {
    "key": "2026-10-28_6_A_all",
    "class": "6",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "all",
    "subject": "Daily Morning Roll Call",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "A",
        "remark": "Unwell / Absent"
      },
      {
        "id": "STU-2024-032",
        "status": "L",
        "remark": "Sanctioned leave"
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T09:30:00.000Z"
  },
  {
    "key": "2026-10-28_6_A_period_1",
    "class": "6",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "1",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T10:00:00.000Z"
  },
  {
    "key": "2026-10-28_6_A_period_2",
    "class": "6",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "2",
    "subject": "English",
    "teacher": "Mrs. Lata Mehta",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T11:00:00.000Z"
  },
  {
    "key": "2026-10-28_6_A_period_3",
    "class": "6",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "3",
    "subject": "Hindi",
    "teacher": "Mrs. Vandana Sharma",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T12:00:00.000Z"
  },
  {
    "key": "2026-10-28_6_A_period_4",
    "class": "6",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "4",
    "subject": "Mathematics",
    "teacher": "Mr. Ramesh Gupta",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "L",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T12:00:00.000Z"
  },
  {
    "key": "2026-10-28_6_A_period_5",
    "class": "6",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "5",
    "subject": "History",
    "teacher": "Mr. Deepak Patil",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T13:00:00.000Z"
  },
  {
    "key": "2026-10-28_6_A_period_6",
    "class": "6",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "6",
    "subject": "Geography",
    "teacher": "Mr. Santosh Chavan",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T14:00:00.000Z"
  },
  {
    "key": "2026-10-28_6_A_period_7",
    "class": "6",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "7",
    "subject": "Science",
    "teacher": "Mrs. Sunita Deshpande",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T14:00:00.000Z"
  },
  {
    "key": "2026-10-28_6_A_period_8",
    "class": "6",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "8",
    "subject": "Physical Education",
    "teacher": "Mr. Vikram Shinde",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T15:00:00.000Z"
  },
  {
    "key": "2026-10-28_6_A_period_9",
    "class": "6",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "9",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T16:00:00.000Z"
  },
  {
    "key": "2026-10-28_7_A_all",
    "class": "7",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "all",
    "subject": "Daily Morning Roll Call",
    "teacher": "Mr. Deepak Patil",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "A",
        "remark": "Unwell / Absent"
      },
      {
        "id": "STU-2024-051",
        "status": "L",
        "remark": "Sanctioned leave"
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T09:30:00.000Z"
  },
  {
    "key": "2026-10-28_7_A_period_1",
    "class": "7",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "1",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T10:00:00.000Z"
  },
  {
    "key": "2026-10-28_7_A_period_2",
    "class": "7",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "2",
    "subject": "English",
    "teacher": "Mrs. Lata Mehta",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T11:00:00.000Z"
  },
  {
    "key": "2026-10-28_7_A_period_3",
    "class": "7",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "3",
    "subject": "Hindi",
    "teacher": "Mrs. Vandana Sharma",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T12:00:00.000Z"
  },
  {
    "key": "2026-10-28_7_A_period_4",
    "class": "7",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "4",
    "subject": "Mathematics",
    "teacher": "Mr. Ramesh Gupta",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "L",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T12:00:00.000Z"
  },
  {
    "key": "2026-10-28_7_A_period_5",
    "class": "7",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "5",
    "subject": "History",
    "teacher": "Mr. Deepak Patil",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T13:00:00.000Z"
  },
  {
    "key": "2026-10-28_7_A_period_6",
    "class": "7",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "6",
    "subject": "Geography",
    "teacher": "Mr. Santosh Chavan",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T14:00:00.000Z"
  },
  {
    "key": "2026-10-28_7_A_period_7",
    "class": "7",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "7",
    "subject": "Science",
    "teacher": "Mrs. Sunita Deshpande",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T14:00:00.000Z"
  },
  {
    "key": "2026-10-28_7_A_period_8",
    "class": "7",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "8",
    "subject": "Physical Education",
    "teacher": "Mr. Vikram Shinde",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T15:00:00.000Z"
  },
  {
    "key": "2026-10-28_7_A_period_9",
    "class": "7",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "9",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T16:00:00.000Z"
  },
  {
    "key": "2026-10-28_8_A_all",
    "class": "8",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "all",
    "subject": "Daily Morning Roll Call",
    "teacher": "Mrs. Lata Mehta",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "A",
        "remark": "Unwell / Absent"
      },
      {
        "id": "STU-2024-069",
        "status": "L",
        "remark": "Sanctioned leave"
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T09:30:00.000Z"
  },
  {
    "key": "2026-10-28_8_A_period_1",
    "class": "8",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "1",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T10:00:00.000Z"
  },
  {
    "key": "2026-10-28_8_A_period_2",
    "class": "8",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "2",
    "subject": "English",
    "teacher": "Mrs. Lata Mehta",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T11:00:00.000Z"
  },
  {
    "key": "2026-10-28_8_A_period_3",
    "class": "8",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "3",
    "subject": "Hindi",
    "teacher": "Mrs. Vandana Sharma",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T12:00:00.000Z"
  },
  {
    "key": "2026-10-28_8_A_period_4",
    "class": "8",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "4",
    "subject": "Mathematics",
    "teacher": "Mr. Ramesh Gupta",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "L",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T12:00:00.000Z"
  },
  {
    "key": "2026-10-28_8_A_period_5",
    "class": "8",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "5",
    "subject": "History",
    "teacher": "Mr. Deepak Patil",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T13:00:00.000Z"
  },
  {
    "key": "2026-10-28_8_A_period_6",
    "class": "8",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "6",
    "subject": "Geography",
    "teacher": "Mr. Santosh Chavan",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T14:00:00.000Z"
  },
  {
    "key": "2026-10-28_8_A_period_7",
    "class": "8",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "7",
    "subject": "Science",
    "teacher": "Mrs. Sunita Deshpande",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T14:00:00.000Z"
  },
  {
    "key": "2026-10-28_8_A_period_8",
    "class": "8",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "8",
    "subject": "Physical Education",
    "teacher": "Mr. Vikram Shinde",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T15:00:00.000Z"
  },
  {
    "key": "2026-10-28_8_A_period_9",
    "class": "8",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "9",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T16:00:00.000Z"
  },
  {
    "key": "2026-10-28_9_A_all",
    "class": "9",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "all",
    "subject": "Daily Morning Roll Call",
    "teacher": "Mrs. Sunita Deshpande",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "A",
        "remark": "Unwell / Absent"
      },
      {
        "id": "STU-2024-088",
        "status": "L",
        "remark": "Sanctioned leave"
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T09:30:00.000Z"
  },
  {
    "key": "2026-10-28_9_A_period_1",
    "class": "9",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "1",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T10:00:00.000Z"
  },
  {
    "key": "2026-10-28_9_A_period_2",
    "class": "9",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "2",
    "subject": "English",
    "teacher": "Mrs. Lata Mehta",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T11:00:00.000Z"
  },
  {
    "key": "2026-10-28_9_A_period_3",
    "class": "9",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "3",
    "subject": "Hindi",
    "teacher": "Mrs. Vandana Sharma",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T12:00:00.000Z"
  },
  {
    "key": "2026-10-28_9_A_period_4",
    "class": "9",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "4",
    "subject": "Algebra",
    "teacher": "Mr. Nitin Kamble",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "L",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T12:00:00.000Z"
  },
  {
    "key": "2026-10-28_9_A_period_5",
    "class": "9",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "5",
    "subject": "Geometry",
    "teacher": "Mrs. Pooja Salunkhe",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T13:00:00.000Z"
  },
  {
    "key": "2026-10-28_9_A_period_6",
    "class": "9",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "6",
    "subject": "History",
    "teacher": "Mr. Deepak Patil",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T14:00:00.000Z"
  },
  {
    "key": "2026-10-28_9_A_period_7",
    "class": "9",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "7",
    "subject": "Geography",
    "teacher": "Mr. Santosh Chavan",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T14:00:00.000Z"
  },
  {
    "key": "2026-10-28_9_A_period_8",
    "class": "9",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "8",
    "subject": "Science",
    "teacher": "Mrs. Sunita Deshpande",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T15:00:00.000Z"
  },
  {
    "key": "2026-10-28_9_A_period_9",
    "class": "9",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "9",
    "subject": "Physical Education",
    "teacher": "Mr. Vikram Shinde",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T16:00:00.000Z"
  },
  {
    "key": "2026-10-28_10_A_all",
    "class": "10",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "all",
    "subject": "Daily Morning Roll Call",
    "teacher": "Mr. Ramesh Gupta",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "A",
        "remark": "Unwell / Absent"
      },
      {
        "id": "STU-2024-104",
        "status": "L",
        "remark": "Sanctioned leave"
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T09:30:00.000Z"
  },
  {
    "key": "2026-10-28_10_A_period_1",
    "class": "10",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "1",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T10:00:00.000Z"
  },
  {
    "key": "2026-10-28_10_A_period_2",
    "class": "10",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "2",
    "subject": "English",
    "teacher": "Mrs. Lata Mehta",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T11:00:00.000Z"
  },
  {
    "key": "2026-10-28_10_A_period_3",
    "class": "10",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "3",
    "subject": "Hindi",
    "teacher": "Mrs. Vandana Sharma",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T12:00:00.000Z"
  },
  {
    "key": "2026-10-28_10_A_period_4",
    "class": "10",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "4",
    "subject": "Algebra",
    "teacher": "Mr. Nitin Kamble",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "L",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T12:00:00.000Z"
  },
  {
    "key": "2026-10-28_10_A_period_5",
    "class": "10",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "5",
    "subject": "Geometry",
    "teacher": "Mrs. Pooja Salunkhe",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T13:00:00.000Z"
  },
  {
    "key": "2026-10-28_10_A_period_6",
    "class": "10",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "6",
    "subject": "History",
    "teacher": "Mr. Deepak Patil",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T14:00:00.000Z"
  },
  {
    "key": "2026-10-28_10_A_period_7",
    "class": "10",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "7",
    "subject": "Geography",
    "teacher": "Mr. Santosh Chavan",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T14:00:00.000Z"
  },
  {
    "key": "2026-10-28_10_A_period_8",
    "class": "10",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "8",
    "subject": "Science",
    "teacher": "Mrs. Sunita Deshpande",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T15:00:00.000Z"
  },
  {
    "key": "2026-10-28_10_A_period_9",
    "class": "10",
    "section": "A",
    "date": "2026-10-28",
    "type": "class",
    "period": "9",
    "subject": "Physical Education",
    "teacher": "Mr. Vikram Shinde",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-28T16:00:00.000Z"
  },
  {
    "key": "2026-10-29_5_A_all",
    "class": "5",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "all",
    "subject": "Daily Morning Roll Call",
    "teacher": "Mrs. Vandana Sharma",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "A",
        "remark": "Unwell / Absent"
      },
      {
        "id": "STU-2024-012",
        "status": "L",
        "remark": "Sanctioned leave"
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "A",
        "remark": "Unwell / Absent"
      }
    ],
    "savedAt": "2026-10-29T09:30:00.000Z"
  },
  {
    "key": "2026-10-29_5_A_period_1",
    "class": "5",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "1",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-29T10:00:00.000Z"
  },
  {
    "key": "2026-10-29_5_A_period_2",
    "class": "5",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "2",
    "subject": "English",
    "teacher": "Mrs. Lata Mehta",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-29T11:00:00.000Z"
  },
  {
    "key": "2026-10-29_5_A_period_3",
    "class": "5",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "3",
    "subject": "Hindi",
    "teacher": "Mrs. Vandana Sharma",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-29T12:00:00.000Z"
  },
  {
    "key": "2026-10-29_5_A_period_4",
    "class": "5",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "4",
    "subject": "Mathematics",
    "teacher": "Mr. Ramesh Gupta",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "L",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-29T12:00:00.000Z"
  },
  {
    "key": "2026-10-29_5_A_period_5",
    "class": "5",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "5",
    "subject": "History",
    "teacher": "Mr. Deepak Patil",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-29T13:00:00.000Z"
  },
  {
    "key": "2026-10-29_5_A_period_6",
    "class": "5",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "6",
    "subject": "Geography",
    "teacher": "Mr. Santosh Chavan",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-29T14:00:00.000Z"
  },
  {
    "key": "2026-10-29_5_A_period_7",
    "class": "5",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "7",
    "subject": "Science",
    "teacher": "Mrs. Sunita Deshpande",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-29T14:00:00.000Z"
  },
  {
    "key": "2026-10-29_5_A_period_8",
    "class": "5",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "8",
    "subject": "Physical Education",
    "teacher": "Mr. Vikram Shinde",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-29T15:00:00.000Z"
  },
  {
    "key": "2026-10-29_5_A_period_9",
    "class": "5",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "9",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "A",
        "remark": "Absent in lecture"
      }
    ],
    "savedAt": "2026-10-29T16:00:00.000Z"
  },
  {
    "key": "2026-10-29_6_A_all",
    "class": "6",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "all",
    "subject": "Daily Morning Roll Call",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "A",
        "remark": "Unwell / Absent"
      },
      {
        "id": "STU-2024-031",
        "status": "L",
        "remark": "Sanctioned leave"
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "A",
        "remark": "Unwell / Absent"
      }
    ],
    "savedAt": "2026-10-29T09:30:00.000Z"
  },
  {
    "key": "2026-10-29_6_A_period_1",
    "class": "6",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "1",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-29T10:00:00.000Z"
  },
  {
    "key": "2026-10-29_6_A_period_2",
    "class": "6",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "2",
    "subject": "English",
    "teacher": "Mrs. Lata Mehta",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-29T11:00:00.000Z"
  },
  {
    "key": "2026-10-29_6_A_period_3",
    "class": "6",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "3",
    "subject": "Hindi",
    "teacher": "Mrs. Vandana Sharma",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-29T12:00:00.000Z"
  },
  {
    "key": "2026-10-29_6_A_period_4",
    "class": "6",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "4",
    "subject": "Mathematics",
    "teacher": "Mr. Ramesh Gupta",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "L",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-29T12:00:00.000Z"
  },
  {
    "key": "2026-10-29_6_A_period_5",
    "class": "6",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "5",
    "subject": "History",
    "teacher": "Mr. Deepak Patil",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-29T13:00:00.000Z"
  },
  {
    "key": "2026-10-29_6_A_period_6",
    "class": "6",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "6",
    "subject": "Geography",
    "teacher": "Mr. Santosh Chavan",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-29T14:00:00.000Z"
  },
  {
    "key": "2026-10-29_6_A_period_7",
    "class": "6",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "7",
    "subject": "Science",
    "teacher": "Mrs. Sunita Deshpande",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-29T14:00:00.000Z"
  },
  {
    "key": "2026-10-29_6_A_period_8",
    "class": "6",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "8",
    "subject": "Physical Education",
    "teacher": "Mr. Vikram Shinde",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-29T15:00:00.000Z"
  },
  {
    "key": "2026-10-29_6_A_period_9",
    "class": "6",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "9",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "A",
        "remark": "Absent in lecture"
      }
    ],
    "savedAt": "2026-10-29T16:00:00.000Z"
  },
  {
    "key": "2026-10-29_7_A_all",
    "class": "7",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "all",
    "subject": "Daily Morning Roll Call",
    "teacher": "Mr. Deepak Patil",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "A",
        "remark": "Unwell / Absent"
      },
      {
        "id": "STU-2024-050",
        "status": "L",
        "remark": "Sanctioned leave"
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "A",
        "remark": "Unwell / Absent"
      }
    ],
    "savedAt": "2026-10-29T09:30:00.000Z"
  },
  {
    "key": "2026-10-29_7_A_period_1",
    "class": "7",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "1",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-29T10:00:00.000Z"
  },
  {
    "key": "2026-10-29_7_A_period_2",
    "class": "7",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "2",
    "subject": "English",
    "teacher": "Mrs. Lata Mehta",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-29T11:00:00.000Z"
  },
  {
    "key": "2026-10-29_7_A_period_3",
    "class": "7",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "3",
    "subject": "Hindi",
    "teacher": "Mrs. Vandana Sharma",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-29T12:00:00.000Z"
  },
  {
    "key": "2026-10-29_7_A_period_4",
    "class": "7",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "4",
    "subject": "Mathematics",
    "teacher": "Mr. Ramesh Gupta",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "L",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-29T12:00:00.000Z"
  },
  {
    "key": "2026-10-29_7_A_period_5",
    "class": "7",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "5",
    "subject": "History",
    "teacher": "Mr. Deepak Patil",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-29T13:00:00.000Z"
  },
  {
    "key": "2026-10-29_7_A_period_6",
    "class": "7",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "6",
    "subject": "Geography",
    "teacher": "Mr. Santosh Chavan",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-29T14:00:00.000Z"
  },
  {
    "key": "2026-10-29_7_A_period_7",
    "class": "7",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "7",
    "subject": "Science",
    "teacher": "Mrs. Sunita Deshpande",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-29T14:00:00.000Z"
  },
  {
    "key": "2026-10-29_7_A_period_8",
    "class": "7",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "8",
    "subject": "Physical Education",
    "teacher": "Mr. Vikram Shinde",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-29T15:00:00.000Z"
  },
  {
    "key": "2026-10-29_7_A_period_9",
    "class": "7",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "9",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "A",
        "remark": "Absent in lecture"
      }
    ],
    "savedAt": "2026-10-29T16:00:00.000Z"
  },
  {
    "key": "2026-10-29_8_A_all",
    "class": "8",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "all",
    "subject": "Daily Morning Roll Call",
    "teacher": "Mrs. Lata Mehta",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "A",
        "remark": "Unwell / Absent"
      },
      {
        "id": "STU-2024-068",
        "status": "L",
        "remark": "Sanctioned leave"
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "A",
        "remark": "Unwell / Absent"
      }
    ],
    "savedAt": "2026-10-29T09:30:00.000Z"
  },
  {
    "key": "2026-10-29_8_A_period_1",
    "class": "8",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "1",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-29T10:00:00.000Z"
  },
  {
    "key": "2026-10-29_8_A_period_2",
    "class": "8",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "2",
    "subject": "English",
    "teacher": "Mrs. Lata Mehta",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-29T11:00:00.000Z"
  },
  {
    "key": "2026-10-29_8_A_period_3",
    "class": "8",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "3",
    "subject": "Hindi",
    "teacher": "Mrs. Vandana Sharma",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-29T12:00:00.000Z"
  },
  {
    "key": "2026-10-29_8_A_period_4",
    "class": "8",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "4",
    "subject": "Mathematics",
    "teacher": "Mr. Ramesh Gupta",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "L",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-29T12:00:00.000Z"
  },
  {
    "key": "2026-10-29_8_A_period_5",
    "class": "8",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "5",
    "subject": "History",
    "teacher": "Mr. Deepak Patil",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-29T13:00:00.000Z"
  },
  {
    "key": "2026-10-29_8_A_period_6",
    "class": "8",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "6",
    "subject": "Geography",
    "teacher": "Mr. Santosh Chavan",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-29T14:00:00.000Z"
  },
  {
    "key": "2026-10-29_8_A_period_7",
    "class": "8",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "7",
    "subject": "Science",
    "teacher": "Mrs. Sunita Deshpande",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-29T14:00:00.000Z"
  },
  {
    "key": "2026-10-29_8_A_period_8",
    "class": "8",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "8",
    "subject": "Physical Education",
    "teacher": "Mr. Vikram Shinde",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-29T15:00:00.000Z"
  },
  {
    "key": "2026-10-29_8_A_period_9",
    "class": "8",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "9",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "A",
        "remark": "Absent in lecture"
      }
    ],
    "savedAt": "2026-10-29T16:00:00.000Z"
  },
  {
    "key": "2026-10-29_9_A_all",
    "class": "9",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "all",
    "subject": "Daily Morning Roll Call",
    "teacher": "Mrs. Sunita Deshpande",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "A",
        "remark": "Unwell / Absent"
      },
      {
        "id": "STU-2024-087",
        "status": "L",
        "remark": "Sanctioned leave"
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "A",
        "remark": "Unwell / Absent"
      }
    ],
    "savedAt": "2026-10-29T09:30:00.000Z"
  },
  {
    "key": "2026-10-29_9_A_period_1",
    "class": "9",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "1",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-29T10:00:00.000Z"
  },
  {
    "key": "2026-10-29_9_A_period_2",
    "class": "9",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "2",
    "subject": "English",
    "teacher": "Mrs. Lata Mehta",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-29T11:00:00.000Z"
  },
  {
    "key": "2026-10-29_9_A_period_3",
    "class": "9",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "3",
    "subject": "Hindi",
    "teacher": "Mrs. Vandana Sharma",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-29T12:00:00.000Z"
  },
  {
    "key": "2026-10-29_9_A_period_4",
    "class": "9",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "4",
    "subject": "Algebra",
    "teacher": "Mr. Nitin Kamble",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "L",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-29T12:00:00.000Z"
  },
  {
    "key": "2026-10-29_9_A_period_5",
    "class": "9",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "5",
    "subject": "Geometry",
    "teacher": "Mrs. Pooja Salunkhe",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-29T13:00:00.000Z"
  },
  {
    "key": "2026-10-29_9_A_period_6",
    "class": "9",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "6",
    "subject": "History",
    "teacher": "Mr. Deepak Patil",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-29T14:00:00.000Z"
  },
  {
    "key": "2026-10-29_9_A_period_7",
    "class": "9",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "7",
    "subject": "Geography",
    "teacher": "Mr. Santosh Chavan",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-29T14:00:00.000Z"
  },
  {
    "key": "2026-10-29_9_A_period_8",
    "class": "9",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "8",
    "subject": "Science",
    "teacher": "Mrs. Sunita Deshpande",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-29T15:00:00.000Z"
  },
  {
    "key": "2026-10-29_9_A_period_9",
    "class": "9",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "9",
    "subject": "Physical Education",
    "teacher": "Mr. Vikram Shinde",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "A",
        "remark": "Absent in lecture"
      }
    ],
    "savedAt": "2026-10-29T16:00:00.000Z"
  },
  {
    "key": "2026-10-29_10_A_all",
    "class": "10",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "all",
    "subject": "Daily Morning Roll Call",
    "teacher": "Mr. Ramesh Gupta",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "A",
        "remark": "Unwell / Absent"
      },
      {
        "id": "STU-2024-009",
        "status": "L",
        "remark": "Sanctioned leave"
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "A",
        "remark": "Unwell / Absent"
      }
    ],
    "savedAt": "2026-10-29T09:30:00.000Z"
  },
  {
    "key": "2026-10-29_10_A_period_1",
    "class": "10",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "1",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-29T10:00:00.000Z"
  },
  {
    "key": "2026-10-29_10_A_period_2",
    "class": "10",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "2",
    "subject": "English",
    "teacher": "Mrs. Lata Mehta",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-29T11:00:00.000Z"
  },
  {
    "key": "2026-10-29_10_A_period_3",
    "class": "10",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "3",
    "subject": "Hindi",
    "teacher": "Mrs. Vandana Sharma",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-29T12:00:00.000Z"
  },
  {
    "key": "2026-10-29_10_A_period_4",
    "class": "10",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "4",
    "subject": "Algebra",
    "teacher": "Mr. Nitin Kamble",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "L",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-29T12:00:00.000Z"
  },
  {
    "key": "2026-10-29_10_A_period_5",
    "class": "10",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "5",
    "subject": "Geometry",
    "teacher": "Mrs. Pooja Salunkhe",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-29T13:00:00.000Z"
  },
  {
    "key": "2026-10-29_10_A_period_6",
    "class": "10",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "6",
    "subject": "History",
    "teacher": "Mr. Deepak Patil",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-29T14:00:00.000Z"
  },
  {
    "key": "2026-10-29_10_A_period_7",
    "class": "10",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "7",
    "subject": "Geography",
    "teacher": "Mr. Santosh Chavan",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-29T14:00:00.000Z"
  },
  {
    "key": "2026-10-29_10_A_period_8",
    "class": "10",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "8",
    "subject": "Science",
    "teacher": "Mrs. Sunita Deshpande",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-29T15:00:00.000Z"
  },
  {
    "key": "2026-10-29_10_A_period_9",
    "class": "10",
    "section": "A",
    "date": "2026-10-29",
    "type": "class",
    "period": "9",
    "subject": "Physical Education",
    "teacher": "Mr. Vikram Shinde",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "A",
        "remark": "Absent in lecture"
      }
    ],
    "savedAt": "2026-10-29T16:00:00.000Z"
  },
  {
    "key": "2026-10-30_5_A_all",
    "class": "5",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "all",
    "subject": "Daily Morning Roll Call",
    "teacher": "Mrs. Vandana Sharma",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "A",
        "remark": "Unwell / Absent"
      },
      {
        "id": "STU-2024-021",
        "status": "L",
        "remark": "Sanctioned leave"
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T09:30:00.000Z"
  },
  {
    "key": "2026-10-30_5_A_period_1",
    "class": "5",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "1",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "A",
        "remark": "Absent in lecture"
      }
    ],
    "savedAt": "2026-10-30T10:00:00.000Z"
  },
  {
    "key": "2026-10-30_5_A_period_2",
    "class": "5",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "2",
    "subject": "English",
    "teacher": "Mrs. Lata Mehta",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T11:00:00.000Z"
  },
  {
    "key": "2026-10-30_5_A_period_3",
    "class": "5",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "3",
    "subject": "Hindi",
    "teacher": "Mrs. Vandana Sharma",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T12:00:00.000Z"
  },
  {
    "key": "2026-10-30_5_A_period_4",
    "class": "5",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "4",
    "subject": "Mathematics",
    "teacher": "Mr. Ramesh Gupta",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "L",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T12:00:00.000Z"
  },
  {
    "key": "2026-10-30_5_A_period_5",
    "class": "5",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "5",
    "subject": "History",
    "teacher": "Mr. Deepak Patil",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T13:00:00.000Z"
  },
  {
    "key": "2026-10-30_5_A_period_6",
    "class": "5",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "6",
    "subject": "Geography",
    "teacher": "Mr. Santosh Chavan",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T14:00:00.000Z"
  },
  {
    "key": "2026-10-30_5_A_period_7",
    "class": "5",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "7",
    "subject": "Science",
    "teacher": "Mrs. Sunita Deshpande",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T14:00:00.000Z"
  },
  {
    "key": "2026-10-30_5_A_period_8",
    "class": "5",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "8",
    "subject": "Physical Education",
    "teacher": "Mr. Vikram Shinde",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T15:00:00.000Z"
  },
  {
    "key": "2026-10-30_5_A_period_9",
    "class": "5",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "9",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T16:00:00.000Z"
  },
  {
    "key": "2026-10-30_6_A_all",
    "class": "6",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "all",
    "subject": "Daily Morning Roll Call",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "A",
        "remark": "Unwell / Absent"
      },
      {
        "id": "STU-2024-040",
        "status": "L",
        "remark": "Sanctioned leave"
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T09:30:00.000Z"
  },
  {
    "key": "2026-10-30_6_A_period_1",
    "class": "6",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "1",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "A",
        "remark": "Absent in lecture"
      }
    ],
    "savedAt": "2026-10-30T10:00:00.000Z"
  },
  {
    "key": "2026-10-30_6_A_period_2",
    "class": "6",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "2",
    "subject": "English",
    "teacher": "Mrs. Lata Mehta",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T11:00:00.000Z"
  },
  {
    "key": "2026-10-30_6_A_period_3",
    "class": "6",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "3",
    "subject": "Hindi",
    "teacher": "Mrs. Vandana Sharma",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T12:00:00.000Z"
  },
  {
    "key": "2026-10-30_6_A_period_4",
    "class": "6",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "4",
    "subject": "Mathematics",
    "teacher": "Mr. Ramesh Gupta",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "L",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T12:00:00.000Z"
  },
  {
    "key": "2026-10-30_6_A_period_5",
    "class": "6",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "5",
    "subject": "History",
    "teacher": "Mr. Deepak Patil",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T13:00:00.000Z"
  },
  {
    "key": "2026-10-30_6_A_period_6",
    "class": "6",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "6",
    "subject": "Geography",
    "teacher": "Mr. Santosh Chavan",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T14:00:00.000Z"
  },
  {
    "key": "2026-10-30_6_A_period_7",
    "class": "6",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "7",
    "subject": "Science",
    "teacher": "Mrs. Sunita Deshpande",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T14:00:00.000Z"
  },
  {
    "key": "2026-10-30_6_A_period_8",
    "class": "6",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "8",
    "subject": "Physical Education",
    "teacher": "Mr. Vikram Shinde",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T15:00:00.000Z"
  },
  {
    "key": "2026-10-30_6_A_period_9",
    "class": "6",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "9",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T16:00:00.000Z"
  },
  {
    "key": "2026-10-30_7_A_all",
    "class": "7",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "all",
    "subject": "Daily Morning Roll Call",
    "teacher": "Mr. Deepak Patil",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "A",
        "remark": "Unwell / Absent"
      },
      {
        "id": "STU-2024-010",
        "status": "L",
        "remark": "Sanctioned leave"
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T09:30:00.000Z"
  },
  {
    "key": "2026-10-30_7_A_period_1",
    "class": "7",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "1",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "A",
        "remark": "Absent in lecture"
      }
    ],
    "savedAt": "2026-10-30T10:00:00.000Z"
  },
  {
    "key": "2026-10-30_7_A_period_2",
    "class": "7",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "2",
    "subject": "English",
    "teacher": "Mrs. Lata Mehta",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T11:00:00.000Z"
  },
  {
    "key": "2026-10-30_7_A_period_3",
    "class": "7",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "3",
    "subject": "Hindi",
    "teacher": "Mrs. Vandana Sharma",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T12:00:00.000Z"
  },
  {
    "key": "2026-10-30_7_A_period_4",
    "class": "7",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "4",
    "subject": "Mathematics",
    "teacher": "Mr. Ramesh Gupta",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "L",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T12:00:00.000Z"
  },
  {
    "key": "2026-10-30_7_A_period_5",
    "class": "7",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "5",
    "subject": "History",
    "teacher": "Mr. Deepak Patil",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T13:00:00.000Z"
  },
  {
    "key": "2026-10-30_7_A_period_6",
    "class": "7",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "6",
    "subject": "Geography",
    "teacher": "Mr. Santosh Chavan",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T14:00:00.000Z"
  },
  {
    "key": "2026-10-30_7_A_period_7",
    "class": "7",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "7",
    "subject": "Science",
    "teacher": "Mrs. Sunita Deshpande",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T14:00:00.000Z"
  },
  {
    "key": "2026-10-30_7_A_period_8",
    "class": "7",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "8",
    "subject": "Physical Education",
    "teacher": "Mr. Vikram Shinde",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T15:00:00.000Z"
  },
  {
    "key": "2026-10-30_7_A_period_9",
    "class": "7",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "9",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T16:00:00.000Z"
  },
  {
    "key": "2026-10-30_8_A_all",
    "class": "8",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "all",
    "subject": "Daily Morning Roll Call",
    "teacher": "Mrs. Lata Mehta",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "A",
        "remark": "Unwell / Absent"
      },
      {
        "id": "STU-2024-008",
        "status": "L",
        "remark": "Sanctioned leave"
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T09:30:00.000Z"
  },
  {
    "key": "2026-10-30_8_A_period_1",
    "class": "8",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "1",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "A",
        "remark": "Absent in lecture"
      }
    ],
    "savedAt": "2026-10-30T10:00:00.000Z"
  },
  {
    "key": "2026-10-30_8_A_period_2",
    "class": "8",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "2",
    "subject": "English",
    "teacher": "Mrs. Lata Mehta",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T11:00:00.000Z"
  },
  {
    "key": "2026-10-30_8_A_period_3",
    "class": "8",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "3",
    "subject": "Hindi",
    "teacher": "Mrs. Vandana Sharma",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T12:00:00.000Z"
  },
  {
    "key": "2026-10-30_8_A_period_4",
    "class": "8",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "4",
    "subject": "Mathematics",
    "teacher": "Mr. Ramesh Gupta",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "L",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T12:00:00.000Z"
  },
  {
    "key": "2026-10-30_8_A_period_5",
    "class": "8",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "5",
    "subject": "History",
    "teacher": "Mr. Deepak Patil",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T13:00:00.000Z"
  },
  {
    "key": "2026-10-30_8_A_period_6",
    "class": "8",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "6",
    "subject": "Geography",
    "teacher": "Mr. Santosh Chavan",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T14:00:00.000Z"
  },
  {
    "key": "2026-10-30_8_A_period_7",
    "class": "8",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "7",
    "subject": "Science",
    "teacher": "Mrs. Sunita Deshpande",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T14:00:00.000Z"
  },
  {
    "key": "2026-10-30_8_A_period_8",
    "class": "8",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "8",
    "subject": "Physical Education",
    "teacher": "Mr. Vikram Shinde",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T15:00:00.000Z"
  },
  {
    "key": "2026-10-30_8_A_period_9",
    "class": "8",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "9",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T16:00:00.000Z"
  },
  {
    "key": "2026-10-30_9_A_all",
    "class": "9",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "all",
    "subject": "Daily Morning Roll Call",
    "teacher": "Mrs. Sunita Deshpande",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "A",
        "remark": "Unwell / Absent"
      },
      {
        "id": "STU-2024-002",
        "status": "L",
        "remark": "Sanctioned leave"
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T09:30:00.000Z"
  },
  {
    "key": "2026-10-30_9_A_period_1",
    "class": "9",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "1",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "A",
        "remark": "Absent in lecture"
      }
    ],
    "savedAt": "2026-10-30T10:00:00.000Z"
  },
  {
    "key": "2026-10-30_9_A_period_2",
    "class": "9",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "2",
    "subject": "English",
    "teacher": "Mrs. Lata Mehta",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T11:00:00.000Z"
  },
  {
    "key": "2026-10-30_9_A_period_3",
    "class": "9",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "3",
    "subject": "Hindi",
    "teacher": "Mrs. Vandana Sharma",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T12:00:00.000Z"
  },
  {
    "key": "2026-10-30_9_A_period_4",
    "class": "9",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "4",
    "subject": "Algebra",
    "teacher": "Mr. Nitin Kamble",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "L",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T12:00:00.000Z"
  },
  {
    "key": "2026-10-30_9_A_period_5",
    "class": "9",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "5",
    "subject": "Geometry",
    "teacher": "Mrs. Pooja Salunkhe",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T13:00:00.000Z"
  },
  {
    "key": "2026-10-30_9_A_period_6",
    "class": "9",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "6",
    "subject": "History",
    "teacher": "Mr. Deepak Patil",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T14:00:00.000Z"
  },
  {
    "key": "2026-10-30_9_A_period_7",
    "class": "9",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "7",
    "subject": "Geography",
    "teacher": "Mr. Santosh Chavan",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T14:00:00.000Z"
  },
  {
    "key": "2026-10-30_9_A_period_8",
    "class": "9",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "8",
    "subject": "Science",
    "teacher": "Mrs. Sunita Deshpande",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T15:00:00.000Z"
  },
  {
    "key": "2026-10-30_9_A_period_9",
    "class": "9",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "9",
    "subject": "Physical Education",
    "teacher": "Mr. Vikram Shinde",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T16:00:00.000Z"
  },
  {
    "key": "2026-10-30_10_A_all",
    "class": "10",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "all",
    "subject": "Daily Morning Roll Call",
    "teacher": "Mr. Ramesh Gupta",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "A",
        "remark": "Unwell / Absent"
      },
      {
        "id": "STU-2024-004",
        "status": "L",
        "remark": "Sanctioned leave"
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T09:30:00.000Z"
  },
  {
    "key": "2026-10-30_10_A_period_1",
    "class": "10",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "1",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "A",
        "remark": "Absent in lecture"
      }
    ],
    "savedAt": "2026-10-30T10:00:00.000Z"
  },
  {
    "key": "2026-10-30_10_A_period_2",
    "class": "10",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "2",
    "subject": "English",
    "teacher": "Mrs. Lata Mehta",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T11:00:00.000Z"
  },
  {
    "key": "2026-10-30_10_A_period_3",
    "class": "10",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "3",
    "subject": "Hindi",
    "teacher": "Mrs. Vandana Sharma",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T12:00:00.000Z"
  },
  {
    "key": "2026-10-30_10_A_period_4",
    "class": "10",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "4",
    "subject": "Algebra",
    "teacher": "Mr. Nitin Kamble",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "L",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T12:00:00.000Z"
  },
  {
    "key": "2026-10-30_10_A_period_5",
    "class": "10",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "5",
    "subject": "Geometry",
    "teacher": "Mrs. Pooja Salunkhe",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T13:00:00.000Z"
  },
  {
    "key": "2026-10-30_10_A_period_6",
    "class": "10",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "6",
    "subject": "History",
    "teacher": "Mr. Deepak Patil",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T14:00:00.000Z"
  },
  {
    "key": "2026-10-30_10_A_period_7",
    "class": "10",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "7",
    "subject": "Geography",
    "teacher": "Mr. Santosh Chavan",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T14:00:00.000Z"
  },
  {
    "key": "2026-10-30_10_A_period_8",
    "class": "10",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "8",
    "subject": "Science",
    "teacher": "Mrs. Sunita Deshpande",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T15:00:00.000Z"
  },
  {
    "key": "2026-10-30_10_A_period_9",
    "class": "10",
    "section": "A",
    "date": "2026-10-30",
    "type": "class",
    "period": "9",
    "subject": "Physical Education",
    "teacher": "Mr. Vikram Shinde",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-30T16:00:00.000Z"
  },
  {
    "key": "2026-10-31_5_A_all",
    "class": "5",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "all",
    "subject": "Daily Morning Roll Call",
    "teacher": "Mrs. Vandana Sharma",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "A",
        "remark": "Unwell / Absent"
      },
      {
        "id": "STU-2024-020",
        "status": "L",
        "remark": "Sanctioned leave"
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T09:30:00.000Z"
  },
  {
    "key": "2026-10-31_5_A_period_1",
    "class": "5",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "1",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T10:00:00.000Z"
  },
  {
    "key": "2026-10-31_5_A_period_2",
    "class": "5",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "2",
    "subject": "English",
    "teacher": "Mrs. Lata Mehta",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T11:00:00.000Z"
  },
  {
    "key": "2026-10-31_5_A_period_3",
    "class": "5",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "3",
    "subject": "Hindi",
    "teacher": "Mrs. Vandana Sharma",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T12:00:00.000Z"
  },
  {
    "key": "2026-10-31_5_A_period_4",
    "class": "5",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "4",
    "subject": "Mathematics",
    "teacher": "Mr. Ramesh Gupta",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "L",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T12:00:00.000Z"
  },
  {
    "key": "2026-10-31_5_A_period_5",
    "class": "5",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "5",
    "subject": "History",
    "teacher": "Mr. Deepak Patil",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T13:00:00.000Z"
  },
  {
    "key": "2026-10-31_5_A_period_6",
    "class": "5",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "6",
    "subject": "Geography",
    "teacher": "Mr. Santosh Chavan",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T14:00:00.000Z"
  },
  {
    "key": "2026-10-31_5_A_period_7",
    "class": "5",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "7",
    "subject": "Science",
    "teacher": "Mrs. Sunita Deshpande",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T14:00:00.000Z"
  },
  {
    "key": "2026-10-31_5_A_period_8",
    "class": "5",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "8",
    "subject": "Physical Education",
    "teacher": "Mr. Vikram Shinde",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T15:00:00.000Z"
  },
  {
    "key": "2026-10-31_5_A_period_9",
    "class": "5",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "9",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T16:00:00.000Z"
  },
  {
    "key": "2026-10-31_6_A_all",
    "class": "6",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "all",
    "subject": "Daily Morning Roll Call",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "A",
        "remark": "Unwell / Absent"
      },
      {
        "id": "STU-2024-039",
        "status": "L",
        "remark": "Sanctioned leave"
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T09:30:00.000Z"
  },
  {
    "key": "2026-10-31_6_A_period_1",
    "class": "6",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "1",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T10:00:00.000Z"
  },
  {
    "key": "2026-10-31_6_A_period_2",
    "class": "6",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "2",
    "subject": "English",
    "teacher": "Mrs. Lata Mehta",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T11:00:00.000Z"
  },
  {
    "key": "2026-10-31_6_A_period_3",
    "class": "6",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "3",
    "subject": "Hindi",
    "teacher": "Mrs. Vandana Sharma",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T12:00:00.000Z"
  },
  {
    "key": "2026-10-31_6_A_period_4",
    "class": "6",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "4",
    "subject": "Mathematics",
    "teacher": "Mr. Ramesh Gupta",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "L",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T12:00:00.000Z"
  },
  {
    "key": "2026-10-31_6_A_period_5",
    "class": "6",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "5",
    "subject": "History",
    "teacher": "Mr. Deepak Patil",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T13:00:00.000Z"
  },
  {
    "key": "2026-10-31_6_A_period_6",
    "class": "6",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "6",
    "subject": "Geography",
    "teacher": "Mr. Santosh Chavan",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T14:00:00.000Z"
  },
  {
    "key": "2026-10-31_6_A_period_7",
    "class": "6",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "7",
    "subject": "Science",
    "teacher": "Mrs. Sunita Deshpande",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T14:00:00.000Z"
  },
  {
    "key": "2026-10-31_6_A_period_8",
    "class": "6",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "8",
    "subject": "Physical Education",
    "teacher": "Mr. Vikram Shinde",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T15:00:00.000Z"
  },
  {
    "key": "2026-10-31_6_A_period_9",
    "class": "6",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "9",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T16:00:00.000Z"
  },
  {
    "key": "2026-10-31_7_A_all",
    "class": "7",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "all",
    "subject": "Daily Morning Roll Call",
    "teacher": "Mr. Deepak Patil",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "A",
        "remark": "Unwell / Absent"
      },
      {
        "id": "STU-2024-058",
        "status": "L",
        "remark": "Sanctioned leave"
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T09:30:00.000Z"
  },
  {
    "key": "2026-10-31_7_A_period_1",
    "class": "7",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "1",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T10:00:00.000Z"
  },
  {
    "key": "2026-10-31_7_A_period_2",
    "class": "7",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "2",
    "subject": "English",
    "teacher": "Mrs. Lata Mehta",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T11:00:00.000Z"
  },
  {
    "key": "2026-10-31_7_A_period_3",
    "class": "7",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "3",
    "subject": "Hindi",
    "teacher": "Mrs. Vandana Sharma",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T12:00:00.000Z"
  },
  {
    "key": "2026-10-31_7_A_period_4",
    "class": "7",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "4",
    "subject": "Mathematics",
    "teacher": "Mr. Ramesh Gupta",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "L",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T12:00:00.000Z"
  },
  {
    "key": "2026-10-31_7_A_period_5",
    "class": "7",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "5",
    "subject": "History",
    "teacher": "Mr. Deepak Patil",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T13:00:00.000Z"
  },
  {
    "key": "2026-10-31_7_A_period_6",
    "class": "7",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "6",
    "subject": "Geography",
    "teacher": "Mr. Santosh Chavan",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T14:00:00.000Z"
  },
  {
    "key": "2026-10-31_7_A_period_7",
    "class": "7",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "7",
    "subject": "Science",
    "teacher": "Mrs. Sunita Deshpande",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T14:00:00.000Z"
  },
  {
    "key": "2026-10-31_7_A_period_8",
    "class": "7",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "8",
    "subject": "Physical Education",
    "teacher": "Mr. Vikram Shinde",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T15:00:00.000Z"
  },
  {
    "key": "2026-10-31_7_A_period_9",
    "class": "7",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "9",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T16:00:00.000Z"
  },
  {
    "key": "2026-10-31_8_A_all",
    "class": "8",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "all",
    "subject": "Daily Morning Roll Call",
    "teacher": "Mrs. Lata Mehta",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "A",
        "remark": "Unwell / Absent"
      },
      {
        "id": "STU-2024-076",
        "status": "L",
        "remark": "Sanctioned leave"
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T09:30:00.000Z"
  },
  {
    "key": "2026-10-31_8_A_period_1",
    "class": "8",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "1",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T10:00:00.000Z"
  },
  {
    "key": "2026-10-31_8_A_period_2",
    "class": "8",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "2",
    "subject": "English",
    "teacher": "Mrs. Lata Mehta",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T11:00:00.000Z"
  },
  {
    "key": "2026-10-31_8_A_period_3",
    "class": "8",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "3",
    "subject": "Hindi",
    "teacher": "Mrs. Vandana Sharma",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T12:00:00.000Z"
  },
  {
    "key": "2026-10-31_8_A_period_4",
    "class": "8",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "4",
    "subject": "Mathematics",
    "teacher": "Mr. Ramesh Gupta",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "L",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T12:00:00.000Z"
  },
  {
    "key": "2026-10-31_8_A_period_5",
    "class": "8",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "5",
    "subject": "History",
    "teacher": "Mr. Deepak Patil",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T13:00:00.000Z"
  },
  {
    "key": "2026-10-31_8_A_period_6",
    "class": "8",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "6",
    "subject": "Geography",
    "teacher": "Mr. Santosh Chavan",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T14:00:00.000Z"
  },
  {
    "key": "2026-10-31_8_A_period_7",
    "class": "8",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "7",
    "subject": "Science",
    "teacher": "Mrs. Sunita Deshpande",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T14:00:00.000Z"
  },
  {
    "key": "2026-10-31_8_A_period_8",
    "class": "8",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "8",
    "subject": "Physical Education",
    "teacher": "Mr. Vikram Shinde",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T15:00:00.000Z"
  },
  {
    "key": "2026-10-31_8_A_period_9",
    "class": "8",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "9",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T16:00:00.000Z"
  },
  {
    "key": "2026-10-31_9_A_all",
    "class": "9",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "all",
    "subject": "Daily Morning Roll Call",
    "teacher": "Mrs. Sunita Deshpande",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "A",
        "remark": "Unwell / Absent"
      },
      {
        "id": "STU-2024-095",
        "status": "L",
        "remark": "Sanctioned leave"
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T09:30:00.000Z"
  },
  {
    "key": "2026-10-31_9_A_period_1",
    "class": "9",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "1",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T10:00:00.000Z"
  },
  {
    "key": "2026-10-31_9_A_period_2",
    "class": "9",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "2",
    "subject": "English",
    "teacher": "Mrs. Lata Mehta",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T11:00:00.000Z"
  },
  {
    "key": "2026-10-31_9_A_period_3",
    "class": "9",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "3",
    "subject": "Hindi",
    "teacher": "Mrs. Vandana Sharma",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T12:00:00.000Z"
  },
  {
    "key": "2026-10-31_9_A_period_4",
    "class": "9",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "4",
    "subject": "Algebra",
    "teacher": "Mr. Nitin Kamble",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "L",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T12:00:00.000Z"
  },
  {
    "key": "2026-10-31_9_A_period_5",
    "class": "9",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "5",
    "subject": "Geometry",
    "teacher": "Mrs. Pooja Salunkhe",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T13:00:00.000Z"
  },
  {
    "key": "2026-10-31_9_A_period_6",
    "class": "9",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "6",
    "subject": "History",
    "teacher": "Mr. Deepak Patil",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T14:00:00.000Z"
  },
  {
    "key": "2026-10-31_9_A_period_7",
    "class": "9",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "7",
    "subject": "Geography",
    "teacher": "Mr. Santosh Chavan",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T14:00:00.000Z"
  },
  {
    "key": "2026-10-31_9_A_period_8",
    "class": "9",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "8",
    "subject": "Science",
    "teacher": "Mrs. Sunita Deshpande",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T15:00:00.000Z"
  },
  {
    "key": "2026-10-31_9_A_period_9",
    "class": "9",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "9",
    "subject": "Physical Education",
    "teacher": "Mr. Vikram Shinde",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T16:00:00.000Z"
  },
  {
    "key": "2026-10-31_10_A_all",
    "class": "10",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "all",
    "subject": "Daily Morning Roll Call",
    "teacher": "Mr. Ramesh Gupta",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "A",
        "remark": "Unwell / Absent"
      },
      {
        "id": "STU-2024-111",
        "status": "L",
        "remark": "Sanctioned leave"
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T09:30:00.000Z"
  },
  {
    "key": "2026-10-31_10_A_period_1",
    "class": "10",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "1",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T10:00:00.000Z"
  },
  {
    "key": "2026-10-31_10_A_period_2",
    "class": "10",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "2",
    "subject": "English",
    "teacher": "Mrs. Lata Mehta",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T11:00:00.000Z"
  },
  {
    "key": "2026-10-31_10_A_period_3",
    "class": "10",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "3",
    "subject": "Hindi",
    "teacher": "Mrs. Vandana Sharma",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T12:00:00.000Z"
  },
  {
    "key": "2026-10-31_10_A_period_4",
    "class": "10",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "4",
    "subject": "Algebra",
    "teacher": "Mr. Nitin Kamble",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "L",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T12:00:00.000Z"
  },
  {
    "key": "2026-10-31_10_A_period_5",
    "class": "10",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "5",
    "subject": "Geometry",
    "teacher": "Mrs. Pooja Salunkhe",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T13:00:00.000Z"
  },
  {
    "key": "2026-10-31_10_A_period_6",
    "class": "10",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "6",
    "subject": "History",
    "teacher": "Mr. Deepak Patil",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T14:00:00.000Z"
  },
  {
    "key": "2026-10-31_10_A_period_7",
    "class": "10",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "7",
    "subject": "Geography",
    "teacher": "Mr. Santosh Chavan",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T14:00:00.000Z"
  },
  {
    "key": "2026-10-31_10_A_period_8",
    "class": "10",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "8",
    "subject": "Science",
    "teacher": "Mrs. Sunita Deshpande",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T15:00:00.000Z"
  },
  {
    "key": "2026-10-31_10_A_period_9",
    "class": "10",
    "section": "A",
    "date": "2026-10-31",
    "type": "class",
    "period": "9",
    "subject": "Physical Education",
    "teacher": "Mr. Vikram Shinde",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-10-31T16:00:00.000Z"
  },
  {
    "key": "2026-11-01_5_A_all",
    "class": "5",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "all",
    "subject": "Daily Morning Roll Call",
    "teacher": "Mrs. Vandana Sharma",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "A",
        "remark": "Unwell / Absent"
      },
      {
        "id": "STU-2024-020",
        "status": "L",
        "remark": "Sanctioned leave"
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T09:30:00.000Z"
  },
  {
    "key": "2026-11-01_5_A_period_1",
    "class": "5",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "1",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T10:00:00.000Z"
  },
  {
    "key": "2026-11-01_5_A_period_2",
    "class": "5",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "2",
    "subject": "English",
    "teacher": "Mrs. Lata Mehta",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T11:00:00.000Z"
  },
  {
    "key": "2026-11-01_5_A_period_3",
    "class": "5",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "3",
    "subject": "Hindi",
    "teacher": "Mrs. Vandana Sharma",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T12:00:00.000Z"
  },
  {
    "key": "2026-11-01_5_A_period_4",
    "class": "5",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "4",
    "subject": "Mathematics",
    "teacher": "Mr. Ramesh Gupta",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "L",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T12:00:00.000Z"
  },
  {
    "key": "2026-11-01_5_A_period_5",
    "class": "5",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "5",
    "subject": "History",
    "teacher": "Mr. Deepak Patil",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T13:00:00.000Z"
  },
  {
    "key": "2026-11-01_5_A_period_6",
    "class": "5",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "6",
    "subject": "Geography",
    "teacher": "Mr. Santosh Chavan",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T14:00:00.000Z"
  },
  {
    "key": "2026-11-01_5_A_period_7",
    "class": "5",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "7",
    "subject": "Science",
    "teacher": "Mrs. Sunita Deshpande",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T14:00:00.000Z"
  },
  {
    "key": "2026-11-01_5_A_period_8",
    "class": "5",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "8",
    "subject": "Physical Education",
    "teacher": "Mr. Vikram Shinde",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-022",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T15:00:00.000Z"
  },
  {
    "key": "2026-11-01_5_A_period_9",
    "class": "5",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "9",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-011",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-012",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-013",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-014",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-015",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-016",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-017",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-018",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-019",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-020",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-021",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-022",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-023",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-024",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-025",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-026",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-027",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-028",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-029",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-030",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T16:00:00.000Z"
  },
  {
    "key": "2026-11-01_6_A_all",
    "class": "6",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "all",
    "subject": "Daily Morning Roll Call",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "A",
        "remark": "Unwell / Absent"
      },
      {
        "id": "STU-2024-039",
        "status": "L",
        "remark": "Sanctioned leave"
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T09:30:00.000Z"
  },
  {
    "key": "2026-11-01_6_A_period_1",
    "class": "6",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "1",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T10:00:00.000Z"
  },
  {
    "key": "2026-11-01_6_A_period_2",
    "class": "6",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "2",
    "subject": "English",
    "teacher": "Mrs. Lata Mehta",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T11:00:00.000Z"
  },
  {
    "key": "2026-11-01_6_A_period_3",
    "class": "6",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "3",
    "subject": "Hindi",
    "teacher": "Mrs. Vandana Sharma",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T12:00:00.000Z"
  },
  {
    "key": "2026-11-01_6_A_period_4",
    "class": "6",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "4",
    "subject": "Mathematics",
    "teacher": "Mr. Ramesh Gupta",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "L",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T12:00:00.000Z"
  },
  {
    "key": "2026-11-01_6_A_period_5",
    "class": "6",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "5",
    "subject": "History",
    "teacher": "Mr. Deepak Patil",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T13:00:00.000Z"
  },
  {
    "key": "2026-11-01_6_A_period_6",
    "class": "6",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "6",
    "subject": "Geography",
    "teacher": "Mr. Santosh Chavan",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T14:00:00.000Z"
  },
  {
    "key": "2026-11-01_6_A_period_7",
    "class": "6",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "7",
    "subject": "Science",
    "teacher": "Mrs. Sunita Deshpande",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T14:00:00.000Z"
  },
  {
    "key": "2026-11-01_6_A_period_8",
    "class": "6",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "8",
    "subject": "Physical Education",
    "teacher": "Mr. Vikram Shinde",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-041",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T15:00:00.000Z"
  },
  {
    "key": "2026-11-01_6_A_period_9",
    "class": "6",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "9",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-007",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-031",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-032",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-033",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-034",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-035",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-036",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-037",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-038",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-039",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-040",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-041",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-042",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-043",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-044",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-045",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-046",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-047",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-048",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-049",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T16:00:00.000Z"
  },
  {
    "key": "2026-11-01_7_A_all",
    "class": "7",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "all",
    "subject": "Daily Morning Roll Call",
    "teacher": "Mr. Deepak Patil",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "A",
        "remark": "Unwell / Absent"
      },
      {
        "id": "STU-2024-058",
        "status": "L",
        "remark": "Sanctioned leave"
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T09:30:00.000Z"
  },
  {
    "key": "2026-11-01_7_A_period_1",
    "class": "7",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "1",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T10:00:00.000Z"
  },
  {
    "key": "2026-11-01_7_A_period_2",
    "class": "7",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "2",
    "subject": "English",
    "teacher": "Mrs. Lata Mehta",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T11:00:00.000Z"
  },
  {
    "key": "2026-11-01_7_A_period_3",
    "class": "7",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "3",
    "subject": "Hindi",
    "teacher": "Mrs. Vandana Sharma",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T12:00:00.000Z"
  },
  {
    "key": "2026-11-01_7_A_period_4",
    "class": "7",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "4",
    "subject": "Mathematics",
    "teacher": "Mr. Ramesh Gupta",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "L",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T12:00:00.000Z"
  },
  {
    "key": "2026-11-01_7_A_period_5",
    "class": "7",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "5",
    "subject": "History",
    "teacher": "Mr. Deepak Patil",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T13:00:00.000Z"
  },
  {
    "key": "2026-11-01_7_A_period_6",
    "class": "7",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "6",
    "subject": "Geography",
    "teacher": "Mr. Santosh Chavan",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T14:00:00.000Z"
  },
  {
    "key": "2026-11-01_7_A_period_7",
    "class": "7",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "7",
    "subject": "Science",
    "teacher": "Mrs. Sunita Deshpande",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T14:00:00.000Z"
  },
  {
    "key": "2026-11-01_7_A_period_8",
    "class": "7",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "8",
    "subject": "Physical Education",
    "teacher": "Mr. Vikram Shinde",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-059",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T15:00:00.000Z"
  },
  {
    "key": "2026-11-01_7_A_period_9",
    "class": "7",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "9",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-005",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-050",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-051",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-052",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-053",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-054",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-055",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-056",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-057",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-058",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-010",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-059",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-060",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-061",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-062",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-063",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-064",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-065",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-066",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-067",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T16:00:00.000Z"
  },
  {
    "key": "2026-11-01_8_A_all",
    "class": "8",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "all",
    "subject": "Daily Morning Roll Call",
    "teacher": "Mrs. Lata Mehta",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "A",
        "remark": "Unwell / Absent"
      },
      {
        "id": "STU-2024-076",
        "status": "L",
        "remark": "Sanctioned leave"
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T09:30:00.000Z"
  },
  {
    "key": "2026-11-01_8_A_period_1",
    "class": "8",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "1",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T10:00:00.000Z"
  },
  {
    "key": "2026-11-01_8_A_period_2",
    "class": "8",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "2",
    "subject": "English",
    "teacher": "Mrs. Lata Mehta",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T11:00:00.000Z"
  },
  {
    "key": "2026-11-01_8_A_period_3",
    "class": "8",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "3",
    "subject": "Hindi",
    "teacher": "Mrs. Vandana Sharma",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T12:00:00.000Z"
  },
  {
    "key": "2026-11-01_8_A_period_4",
    "class": "8",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "4",
    "subject": "Mathematics",
    "teacher": "Mr. Ramesh Gupta",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "L",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T12:00:00.000Z"
  },
  {
    "key": "2026-11-01_8_A_period_5",
    "class": "8",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "5",
    "subject": "History",
    "teacher": "Mr. Deepak Patil",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T13:00:00.000Z"
  },
  {
    "key": "2026-11-01_8_A_period_6",
    "class": "8",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "6",
    "subject": "Geography",
    "teacher": "Mr. Santosh Chavan",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T14:00:00.000Z"
  },
  {
    "key": "2026-11-01_8_A_period_7",
    "class": "8",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "7",
    "subject": "Science",
    "teacher": "Mrs. Sunita Deshpande",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T14:00:00.000Z"
  },
  {
    "key": "2026-11-01_8_A_period_8",
    "class": "8",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "8",
    "subject": "Physical Education",
    "teacher": "Mr. Vikram Shinde",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-077",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T15:00:00.000Z"
  },
  {
    "key": "2026-11-01_8_A_period_9",
    "class": "8",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "9",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-003",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-068",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-069",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-070",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-071",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-072",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-073",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-074",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-075",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-076",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-008",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-077",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-078",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-079",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-080",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-081",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-082",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-083",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-084",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-085",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T16:00:00.000Z"
  },
  {
    "key": "2026-11-01_9_A_all",
    "class": "9",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "all",
    "subject": "Daily Morning Roll Call",
    "teacher": "Mrs. Sunita Deshpande",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "A",
        "remark": "Unwell / Absent"
      },
      {
        "id": "STU-2024-095",
        "status": "L",
        "remark": "Sanctioned leave"
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T09:30:00.000Z"
  },
  {
    "key": "2026-11-01_9_A_period_1",
    "class": "9",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "1",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T10:00:00.000Z"
  },
  {
    "key": "2026-11-01_9_A_period_2",
    "class": "9",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "2",
    "subject": "English",
    "teacher": "Mrs. Lata Mehta",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T11:00:00.000Z"
  },
  {
    "key": "2026-11-01_9_A_period_3",
    "class": "9",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "3",
    "subject": "Hindi",
    "teacher": "Mrs. Vandana Sharma",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T12:00:00.000Z"
  },
  {
    "key": "2026-11-01_9_A_period_4",
    "class": "9",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "4",
    "subject": "Algebra",
    "teacher": "Mr. Nitin Kamble",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "L",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T12:00:00.000Z"
  },
  {
    "key": "2026-11-01_9_A_period_5",
    "class": "9",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "5",
    "subject": "Geometry",
    "teacher": "Mrs. Pooja Salunkhe",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T13:00:00.000Z"
  },
  {
    "key": "2026-11-01_9_A_period_6",
    "class": "9",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "6",
    "subject": "History",
    "teacher": "Mr. Deepak Patil",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T14:00:00.000Z"
  },
  {
    "key": "2026-11-01_9_A_period_7",
    "class": "9",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "7",
    "subject": "Geography",
    "teacher": "Mr. Santosh Chavan",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T14:00:00.000Z"
  },
  {
    "key": "2026-11-01_9_A_period_8",
    "class": "9",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "8",
    "subject": "Science",
    "teacher": "Mrs. Sunita Deshpande",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-006",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T15:00:00.000Z"
  },
  {
    "key": "2026-11-01_9_A_period_9",
    "class": "9",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "9",
    "subject": "Physical Education",
    "teacher": "Mr. Vikram Shinde",
    "records": [
      {
        "id": "STU-2024-086",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-087",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-088",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-089",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-090",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-091",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-092",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-093",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-094",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-095",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-002",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-006",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-096",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-097",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-098",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-099",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-100",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-101",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-102",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-103",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T16:00:00.000Z"
  },
  {
    "key": "2026-11-01_10_A_all",
    "class": "10",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "all",
    "subject": "Daily Morning Roll Call",
    "teacher": "Mr. Ramesh Gupta",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "A",
        "remark": "Unwell / Absent"
      },
      {
        "id": "STU-2024-111",
        "status": "L",
        "remark": "Sanctioned leave"
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T09:30:00.000Z"
  },
  {
    "key": "2026-11-01_10_A_period_1",
    "class": "10",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "1",
    "subject": "Marathi",
    "teacher": "Mr. Prakash Kulkarni",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T10:00:00.000Z"
  },
  {
    "key": "2026-11-01_10_A_period_2",
    "class": "10",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "2",
    "subject": "English",
    "teacher": "Mrs. Lata Mehta",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T11:00:00.000Z"
  },
  {
    "key": "2026-11-01_10_A_period_3",
    "class": "10",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "3",
    "subject": "Hindi",
    "teacher": "Mrs. Vandana Sharma",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T12:00:00.000Z"
  },
  {
    "key": "2026-11-01_10_A_period_4",
    "class": "10",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "4",
    "subject": "Algebra",
    "teacher": "Mr. Nitin Kamble",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "L",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T12:00:00.000Z"
  },
  {
    "key": "2026-11-01_10_A_period_5",
    "class": "10",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "5",
    "subject": "Geometry",
    "teacher": "Mrs. Pooja Salunkhe",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T13:00:00.000Z"
  },
  {
    "key": "2026-11-01_10_A_period_6",
    "class": "10",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "6",
    "subject": "History",
    "teacher": "Mr. Deepak Patil",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T14:00:00.000Z"
  },
  {
    "key": "2026-11-01_10_A_period_7",
    "class": "10",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "7",
    "subject": "Geography",
    "teacher": "Mr. Santosh Chavan",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T14:00:00.000Z"
  },
  {
    "key": "2026-11-01_10_A_period_8",
    "class": "10",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "8",
    "subject": "Science",
    "teacher": "Mrs. Sunita Deshpande",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-112",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T15:00:00.000Z"
  },
  {
    "key": "2026-11-01_10_A_period_9",
    "class": "10",
    "section": "A",
    "date": "2026-11-01",
    "type": "class",
    "period": "9",
    "subject": "Physical Education",
    "teacher": "Mr. Vikram Shinde",
    "records": [
      {
        "id": "STU-2024-001",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-009",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-104",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-105",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-106",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-107",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-108",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-109",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-110",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-111",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-004",
        "status": "A",
        "remark": "Absent in lecture"
      },
      {
        "id": "STU-2024-112",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-113",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-114",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-115",
        "status": "L",
        "remark": ""
      },
      {
        "id": "STU-2024-116",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-117",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-118",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-119",
        "status": "P",
        "remark": ""
      },
      {
        "id": "STU-2024-120",
        "status": "P",
        "remark": ""
      }
    ],
    "savedAt": "2026-11-01T16:00:00.000Z"
  }
];

const DEMO_FEE_PAYMENTS = [
  {
    id: 'RCP-1001',
    receiptNo: 'RCP-0001',
    studentId: 'STU-2024-001',
    amount: 35000,
    date: '2024-08-10',
    mode: 'UPI',
    remark: 'Term 1 fee paid via GPay',
    createdAt: '2024-08-10T10:30:00.000Z'
  },
  {
    id: 'RCP-1002',
    receiptNo: 'RCP-0002',
    studentId: 'STU-2024-002',
    amount: 50000,
    date: '2024-08-12',
    mode: 'Online',
    remark: 'Full annual fee paid',
    createdAt: '2024-08-12T11:00:00.000Z'
  },
  {
    id: 'RCP-1003',
    receiptNo: 'RCP-0003',
    studentId: 'STU-2024-003',
    amount: 10000,
    date: '2024-08-15',
    mode: 'Cash',
    remark: 'Paid at school office',
    createdAt: '2024-08-15T09:15:00.000Z'
  }
];

const DEMO_RESULTS = [
  {
    key: 'STU-2024-001_Half Yearly_2026',
    studentId: 'STU-2024-001',
    class: '10',
    section: 'A',
    exam: 'Half Yearly',
    year: '2026',
    subjects: {
      'Mathematics': 92,
      'Science': 88,
      'English': 85,
      'Social Science': 80,
      'Hindi': 78,
      'Marathi': 82
    },
    total: 505,
    maxTotal: 600,
    percentage: 84.17,
    grade: 'A',
    remark: 'Very Good',
    pass: true,
    savedAt: '2026-09-10T10:00:00.000Z'
  },
  {
    key: 'STU-2024-004_Half Yearly_2026',
    studentId: 'STU-2024-004',
    class: '10',
    section: 'A',
    exam: 'Half Yearly',
    year: '2026',
    subjects: {
      'Mathematics': 95,
      'Science': 94,
      'English': 90,
      'Social Science': 89,
      'Hindi': 88,
      'Marathi': 91
    },
    total: 547,
    maxTotal: 600,
    percentage: 91.17,
    grade: 'A+',
    remark: 'Excellent',
    pass: true,
    savedAt: '2026-09-10T10:00:00.000Z'
  }
];

const DEMO_HOSTEL_LEAVES = [
  {
    id: 'LV-101',
    studentId: 'STU-2024-001',
    leaveDate: '2024-09-20',
    returnDate: '2024-09-23',
    reason: 'Family Event',
    status: 'returned',
    createdAt: '2024-09-19T10:00:00.000Z'
  },
  {
    id: 'LV-102',
    studentId: 'STU-2024-002',
    leaveDate: '2024-09-25',
    returnDate: '2024-09-28',
    reason: 'Medical',
    status: 'out',
    createdAt: '2024-09-24T12:00:00.000Z'
  }
];

const DEMO_TEACHER_LEAVE = [
  {
    id: 'TL-101',
    staffId: 'ST-001',
    staffName: 'Mr. Ramesh Gupta',
    leaveType: 'Casual',
    startDate: '2026-09-28',
    endDate: '2026-09-29',
    days: 2,
    reason: 'Personal family work in hometown',
    status: 'Pending',
    substitutes: {},
    appliedAt: '2026-09-26T09:00:00.000Z'
  },
  {
    id: 'TL-102',
    staffId: 'ST-002',
    staffName: 'Mrs. Sunita Deshpande',
    leaveType: 'Medical',
    startDate: '2026-09-25',
    endDate: '2026-09-26',
    days: 2,
    reason: 'Viral fever and doctor consultation',
    status: 'Approved',
    approvedBy: 'principal',
    substitutes: {
      'Period 3': 'Mrs. Lata Mehta'
    },
    appliedAt: '2026-09-24T14:30:00.000Z'
  }
];

const DEMO_MEDICAL = [
  {
    id: 'MED-101',
    studentId: 'STU-2024-001',
    studentName: 'Aarav Sharma',
    class: '10',
    section: 'A',
    date: '2026-09-27',
    incidentType: 'Sports Injury / Ankle Sprain',
    severity: 'Medium',
    symptoms: 'Sprained left ankle during evening playground games. Mild joint swelling.',
    doctorName: 'Dr. M. K. Kulkarni Clinic (Bachani)',
    escortStaff: 'Mr. Vikram Shinde (PE Teacher)',
    treatment: 'Crepe bandage support, Fastum pain relief gel, and 2 days complete rest advised.',
    medicineGiven: 'Ibuprofen 400mg after dinner, Pain spray, warm compress',
    medicineIncharge: 'Mr. Ramesh Shinde (Residential Mentor)',
    medicalCost: 250,
    costPaidBy: 'School Emergency Health Fund',
    attendedBy: 'Dr. M. K. Kulkarni Clinic (Bachani)',
    guardianNotified: true,
    parentContact: '9876543210 (Rajesh Sharma)',
    parentNote: 'Father Rajesh Sharma informed by phone call. Student resting in Junior Boys Wing Room 202.',
    status: 'Resting in Hostel',
    hospitalShifted: false,
    allergies: 'Penicillin',
    bloodGroup: 'B+'
  },
  {
    id: 'MED-102',
    studentId: 'STU-2024-004',
    studentName: 'Sneha Kulkarni',
    class: '10',
    section: 'A',
    date: '2026-09-25',
    incidentType: 'Seasonal Viral Fever & Cold',
    severity: 'Normal',
    symptoms: 'Mild fever 100.2°F, headache, throat congestion, body fatigue',
    doctorName: 'Dr. M. K. Kulkarni Clinic (Bachani)',
    escortStaff: 'Mr. Sanjay Bhosale (Residential Mentor)',
    treatment: 'Doctor checkup completed. Prescribed Paracetamol 500mg, Cheston Cold syrup, herbal kadha at mess.',
    medicineGiven: 'Paracetamol 500mg (twice daily after meals), Cough Syrup 5ml bedtime',
    medicineIncharge: 'Mr. Sanjay Bhosale (Residential Mentor)',
    medicalCost: 180,
    costPaidBy: 'School Emergency Health Fund',
    attendedBy: 'Dr. M. K. Kulkarni Clinic (Bachani)',
    guardianNotified: true,
    parentContact: '9876543213 (Mahesh Kulkarni)',
    parentNote: 'Mother informed. Fever normalized on Day 2; student completed medication and returned fit to Class 10-A.',
    status: 'Resolved',
    hospitalShifted: false,
    allergies: 'None',
    bloodGroup: 'O+'
  },
  {
    id: 'MED-103',
    studentId: 'STU-2024-002',
    studentName: 'Priya Patil',
    class: '9',
    section: 'A',
    date: '2026-09-20',
    incidentType: 'Acute Stomach Ache & Dehydration',
    severity: 'Critical',
    symptoms: 'Severe abdominal cramps, acute vomiting and dehydration in hostel room',
    doctorName: 'Kagal Sub-District Civil Hospital',
    escortStaff: 'Mr. Sanjay Bhosale (Residential Mentor) & Mrs. Vandana Sharma (Teacher)',
    treatment: 'Emergency doctor consultation, IV fluid drip given, ultrasound scan clear, prescribed antacids and probiotics.',
    medicineGiven: 'Pantocid 40mg (morning), Electral ORS drink 1 liter, light boiled khichdi diet',
    medicineIncharge: 'Mr. Sanjay Bhosale (Residential Mentor)',
    medicalCost: 450,
    costPaidBy: 'School Emergency Health Fund',
    attendedBy: 'Kagal Sub-District Civil Hospital',
    guardianNotified: true,
    parentContact: '9876543211 (Sunil Patil)',
    parentNote: 'Father Sunil Patil called immediately. Student discharged after 4 hours of observation and fully recovered.',
    status: 'Resolved',
    hospitalShifted: true,
    allergies: 'Dust, Peanuts',
    bloodGroup: 'A+'
  }
];

const DEMO_EXPENSES = [
  {
    id: 'EXP-101',
    studentId: 'STU-2024-001',
    studentName: 'Aarav Sharma',
    date: '2026-09-15',
    category: 'Deposit',
    amount: 2500,
    txnType: 'Deposit',
    description: 'Parent Top-up via GPay (Father: Rajesh Sharma)',
    receiptNo: 'RCP-DEP-101',
    incharge: 'Residential Mentor Office',
    balanceAfter: 2500
  },
  {
    id: 'EXP-102',
    studentId: 'STU-2024-001',
    studentName: 'Aarav Sharma',
    date: '2026-09-20',
    category: 'Toiletries',
    amount: 180,
    txnType: 'Expense',
    description: 'Bathing soap, toothpaste & hair oil from campus store',
    receiptNo: 'BILL-4389',
    incharge: 'Mr. Sanjay Bhosale (Residential Mentor)',
    balanceAfter: 2320
  },
  {
    id: 'EXP-103',
    studentId: 'STU-2024-001',
    studentName: 'Aarav Sharma',
    date: '2026-09-25',
    category: 'Stationery',
    amount: 250,
    txnType: 'Expense',
    description: 'Geometry box, practical notebook & drawing pencils',
    receiptNo: 'BILL-4421',
    incharge: 'Mr. Ramesh Gupta (Teacher)',
    balanceAfter: 2070
  },
  {
    id: 'EXP-104',
    studentId: 'STU-2024-009',
    studentName: 'Sachin Pawar',
    date: '2026-09-18',
    category: 'Deposit',
    amount: 2000,
    txnType: 'Deposit',
    description: 'Parent Top-up via PhonePe (Father: Namdeo Pawar)',
    receiptNo: 'RCP-DEP-102',
    incharge: 'Residential Mentor Office',
    balanceAfter: 2000
  },
  {
    id: 'EXP-105',
    studentId: 'STU-2024-009',
    studentName: 'Sachin Pawar',
    date: '2026-09-28',
    category: 'Grooming',
    amount: 100,
    txnType: 'Expense',
    description: 'Monthly haircut and grooming at Bachani village salon',
    receiptNo: 'BILL-4435',
    incharge: 'Mr. Deepak Kadam (Residential Mentor)',
    balanceAfter: 1900
  },
  {
    id: 'EXP-106',
    studentId: 'STU-2024-011',
    studentName: 'Omkar Shinde',
    date: '2026-09-10',
    category: 'Deposit',
    amount: 1500,
    txnType: 'Deposit',
    description: 'Parent Cash Deposit at Hostel Office (Father: Dattatray Shinde)',
    receiptNo: 'RCP-DEP-103',
    incharge: 'Residential Mentor Office',
    balanceAfter: 1500
  },
  {
    id: 'EXP-107',
    studentId: 'STU-2024-011',
    studentName: 'Omkar Shinde',
    date: '2026-09-22',
    category: 'Stationery',
    amount: 150,
    txnType: 'Expense',
    description: 'English cursive workbook & sketch pens',
    receiptNo: 'BILL-4402',
    incharge: 'Mr. Sanjay Bhosale (Residential Mentor)',
    balanceAfter: 1350
  },
  {
    id: 'EXP-108',
    studentId: 'STU-2024-012',
    studentName: 'Tanmay Joshi',
    date: '2026-09-12',
    category: 'Deposit',
    amount: 2000,
    txnType: 'Deposit',
    description: 'Parent Top-up via Net Banking (Father: Makarand Joshi)',
    receiptNo: 'RCP-DEP-104',
    incharge: 'Residential Mentor Office',
    balanceAfter: 2000
  },
  {
    id: 'EXP-109',
    studentId: 'STU-2024-012',
    studentName: 'Tanmay Joshi',
    date: '2026-09-26',
    category: 'Medical',
    amount: 220,
    txnType: 'Expense',
    description: 'Prescription vitamin drops & cough syrup from Kagal pharmacy',
    receiptNo: 'BILL-4440',
    incharge: 'Mr. Sanjay Bhosale (Residential Mentor)',
    balanceAfter: 1780
  },
  {
    id: 'EXP-110',
    studentId: 'STU-2024-031',
    studentName: 'Vedant Kulkarni',
    date: '2026-09-14',
    category: 'Deposit',
    amount: 1800,
    txnType: 'Deposit',
    description: 'Parent Top-up via UPI (Father: Suhas Kulkarni)',
    receiptNo: 'RCP-DEP-105',
    incharge: 'Residential Mentor Office',
    balanceAfter: 1800
  },
  {
    id: 'EXP-111',
    studentId: 'STU-2024-031',
    studentName: 'Vedant Kulkarni',
    date: '2026-09-27',
    category: 'Uniform',
    amount: 120,
    txnType: 'Expense',
    description: 'School shoe repair and extra white socks pair',
    receiptNo: 'BILL-4448',
    incharge: 'Mr. Ramesh Shinde (Residential Mentor)',
    balanceAfter: 1680
  },
  {
    id: 'EXP-112',
    studentId: 'STU-2024-068',
    studentName: 'Chinmay Kadam',
    date: '2026-09-15',
    category: 'Deposit',
    amount: 2200,
    txnType: 'Deposit',
    description: 'Parent Top-up via GPay (Father: Vinayak Kadam)',
    receiptNo: 'RCP-DEP-106',
    incharge: 'Residential Mentor Office',
    balanceAfter: 2200
  },
  {
    id: 'EXP-113',
    studentId: 'STU-2024-068',
    studentName: 'Chinmay Kadam',
    date: '2026-09-29',
    category: 'Stationery',
    amount: 280,
    txnType: 'Expense',
    description: 'Science project chart papers, thermocol sheets & adhesive',
    receiptNo: 'BILL-4455',
    incharge: 'Mr. Suresh Jadhav (Mentor)',
    balanceAfter: 1920
  }
];

const DEMO_MENTORS = [
  {
    id: 'MEN-01',
    name: 'Sanjay Bhosale (Residential Mentor)',
    role: 'Residential Mentor — Boys Wing 1 (Class 5–6)',
    wing: 'Junior Boys Wing A (Rooms 201–204)',
    rooms: ['201', '202', '203', '204'],
    phone: '9822001101',
    color: '#3b82f6',
    targetWards: 16,
    activeRollCall: 'Complete (16/16)',
    lastCallDate: '2026-11-01',
    notes: ''
  },
  {
    id: 'MEN-02',
    name: 'Ramesh Shinde (Residential Mentor)',
    role: 'Residential Mentor — Boys Wing 2 (Class 6–7)',
    wing: 'Junior Boys Wing B (Rooms 205–208)',
    rooms: ['205', '206', '207', '208'],
    phone: '9822001102',
    color: '#0ea5e9',
    targetWards: 16,
    activeRollCall: 'Complete (16/16)',
    lastCallDate: '2026-11-01',
    notes: ''
  },
  {
    id: 'MEN-03',
    name: 'Suresh Jadhav (Residential Mentor)',
    role: 'Residential Mentor — Boys Wing 3 (Class 8–9)',
    wing: 'Middle Boys Wing (Rooms 209–212)',
    rooms: ['209', '210', '211', '212'],
    phone: '9822001103',
    color: '#10b981',
    targetWards: 16,
    activeRollCall: 'Complete (16/16)',
    lastCallDate: '2026-11-01',
    notes: ''
  },
  {
    id: 'MEN-04',
    name: 'Deepak Kadam (Residential Mentor)',
    role: 'Residential Mentor — Boys Wing 4 (Class 9–10)',
    wing: 'Senior Boys Wing (Rooms 213–215)',
    rooms: ['213', '214', '215'],
    phone: '9822001104',
    color: '#8b5cf6',
    targetWards: 12,
    activeRollCall: 'Complete (12/12)',
    lastCallDate: '2026-11-01',
    notes: ''
  }
];

/* ── In-Memory DB ── */
const initialTimetableData = generateFullSchoolTimetable(DEFAULT_SCHEDULE_CONFIG, DEMO_STAFF);
initialTimetableData.status = 'published';

const store = {
  students: [...DEMO_STUDENTS],
  staff: [...DEMO_STAFF],
  notices: [...DEMO_NOTICES],
  hostelRooms: [...DEMO_HOSTEL_ROOMS],
  hostelLeaves: [...DEMO_HOSTEL_LEAVES],
  feeStructure: { ...DEMO_FEE_STRUCTURE },
  feePayments: [...DEMO_FEE_PAYMENTS],
  attendance: [...DEMO_ATTENDANCE],
  results: [...DEMO_RESULTS],
  timetableConfig: JSON.parse(JSON.stringify(DEFAULT_SCHEDULE_CONFIG)),
  publishedTimetable: initialTimetableData,
  draftTimetable: null,
  timetables: initialTimetableData.classes,
  achievements: [...DEMO_ACHIEVEMENTS],
  sports: [...DEMO_SPORTS],
  messMenu: { ...DEMO_MESS_MENU },
  medical: [...DEMO_MEDICAL],
  expenses: [...DEMO_EXPENSES],
  teacherLeave: [...DEMO_TEACHER_LEAVE],
  mentor: [...DEMO_MENTORS],
  mentorCalls: [
    {
      id: 'CALL-101',
      date: '2026-10-25',
      mentorName: 'Deepak Kadam',
      studentId: 'STU-2024-001',
      studentName: 'Aarav Sharma',
      parentName: 'Rajesh Sharma',
      category: 'Academic Progress',
      summary: 'Aarav completed science project chapter. Recommended 1 extra geometry practice set. Cheerful and confident.',
      emotionalState: 'Focused'
    },
    {
      id: 'CALL-102',
      date: '2026-10-20',
      mentorName: 'Sanjay Bhosale',
      studentId: 'STU-2024-002',
      studentName: 'Priya Patil',
      parentName: 'Sunil Patil',
      category: 'Health & Recovery',
      summary: 'Informed father about full recovery from seasonal cold. Eating well and attending evening prayer.',
      emotionalState: 'Cheerful'
    }
  ],
  nightRollCalls: {},
  parent: [],
};

/* ── Generic CRUD helpers ── */
export const DB = {
  genId: (prefix = 'ID') => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,

  students: {
    getAll: () => store.students,
    getById: (id) => store.students.find(s => s.id === id),
    getByClass: (cls, sec) => store.students.filter(s =>
      s.class == cls && (!sec || sec === 'all' || s.section === sec)
    ),
    getResidential: () => store.students.filter(s => s.type === 'residential'),
    getDayScholars: () => store.students.filter(s => s.type === 'day'),
    search: (q) => {
      const query = q.toLowerCase();
      return store.students.filter(s =>
        s.name?.toLowerCase().includes(query) ||
        s.id?.toLowerCase().includes(query) ||
        s.rollNo?.toLowerCase().includes(query)
      );
    },
    getStats: () => {
      const all = store.students;
      const byClass = {};
      let residential = 0, day = 0;
      all.forEach(s => {
        if (s.type === 'residential') residential++; else day++;
        byClass[s.class] = (byClass[s.class] || 0) + 1;
      });
      return { total: all.length, residential, day, byClass };
    },
    save: (data) => {
      if (!data.id) {
        const year = new Date().getFullYear();
        data.id = `STU-${year}-${String(store.students.length + 1).padStart(3, '0')}`;
        data.rollNo = data.rollNo || data.id;
        data.createdAt = new Date().toISOString();
        store.students.push(data);
      } else {
        const idx = store.students.findIndex(s => s.id === data.id);
        if (idx !== -1) {
          store.students[idx] = { ...store.students[idx], ...data };
        } else {
          data.rollNo = data.rollNo || data.id;
          data.createdAt = new Date().toISOString();
          store.students.push(data);
        }
      }
      // Async persist to MongoDB if available
      try {
        Student.findOneAndUpdate({ id: data.id }, data, { upsert: true }).catch(() => { });
      } catch { }
      return data;
    },
    delete: (id) => {
      store.students = store.students.filter(s => s.id !== id);
      try { Student.deleteOne({ id }).catch(() => { }); } catch { }
    }
  },

  staff: {
    getAll: () => store.staff,
    getById: (id) => store.staff.find(s => s.id === id),
    getTeachers: () => store.staff.filter(s => s.role === 'teacher'),
    save: (data) => {
      if (!data.id) {
        data.id = `ST-${String(store.staff.length + 1).padStart(3, '0')}`;
        data.createdAt = new Date().toISOString();
        store.staff.push(data);
      } else {
        const idx = store.staff.findIndex(s => s.id === data.id);
        if (idx !== -1) store.staff[idx] = { ...store.staff[idx], ...data };
      }
      return data;
    },
    delete: (id) => { store.staff = store.staff.filter(s => s.id !== id); }
  },

  attendance: {
    save: (cls, section, date, type, records, extra = {}) => {
      const period = String(extra.period || (type && type.startsWith('period_') ? type.replace('period_', '') : (type === 'class' ? 'all' : type)));
      const key = `${date}_${cls}_${section}_${period === 'all' ? 'all' : `period_${period}`}`;
      const idx = store.attendance.findIndex(a => a.key === key);
      const entry = {
        key,
        class: String(cls),
        section: section || 'A',
        date,
        type: type || 'class',
        period,
        subject: extra.subject || '',
        teacher: extra.teacher || '',
        records: records || [],
        savedAt: new Date().toISOString()
      };
      if (idx !== -1) store.attendance[idx] = entry;
      else store.attendance.push(entry);
      return entry;
    },

    get: (cls, section, date, typeOrPeriod) => {
      const p = String(typeOrPeriod || 'all');
      const key1 = `${date}_${cls}_${section}_${p}`;
      const key2 = `${date}_${cls}_${section}_period_${p}`;
      const key3 = `${date}_${cls}_${section}_all`;
      return store.attendance.find(a => a.key === key1 || a.key === key2 || (p === 'all' && a.key === key3)) ||
        store.attendance.find(a => String(a.class) === String(cls) && a.section === section && a.date === date && (String(a.period) === p || a.type === typeOrPeriod));
    },

    getDayRegister: (date, cls, section = 'A') => {
      const targetClass = String(cls || '10').replace(/\D/g, '') || '10';
      const secLetters = String(section || 'A').match(/[A-Za-z]/g);
      const targetSection = secLetters ? secLetters[secLetters.length - 1].toUpperCase() : 'A';
      const students = store.students.filter(s => String(s.class) === targetClass && s.section === targetSection);
      const dayEntries = store.attendance.filter(a => a.date === date && String(a.class) === targetClass && a.section === targetSection);
      const dailyEntry = dayEntries.find(a => a.period === 'all' || a.type === 'class_daily');

      const periodEntries = {};
      for (let p = 1; p <= 9; p++) {
        periodEntries[p] = dayEntries.find(a => String(a.period) === String(p)) || null;
      }

      let totalP = 0, totalA = 0, totalL = 0;
      const studentRows = students.map(s => {
        const dRec = dailyEntry?.records?.find(r => r.id === s.id);
        const dailyStatus = dRec ? dRec.status : 'P';
        if (dailyStatus === 'P') totalP++;
        else if (dailyStatus === 'A') totalA++;
        else if (dailyStatus === 'L') totalL++;

        const periods = {};
        let presentCount = 0, conductedCount = 0;
        for (let p = 1; p <= 9; p++) {
          const pEntry = periodEntries[p];
          if (pEntry) {
            conductedCount++;
            const pRec = pEntry.records?.find(r => r.id === s.id);
            const status = pRec ? pRec.status : dailyStatus;
            periods[p] = { status, subject: pEntry.subject, teacher: pEntry.teacher };
            if (status === 'P') presentCount++;
          } else {
            periods[p] = { status: dailyEntry ? dailyStatus : '—', subject: '', teacher: '' };
            if (dailyEntry && dailyStatus === 'P') presentCount++;
            if (dailyEntry) conductedCount++;
          }
        }

        const pct = conductedCount > 0 ? Math.round((presentCount / conductedCount) * 100) : (dailyStatus === 'P' ? 100 : 0);

        return {
          student: s,
          dailyStatus,
          dailyRemark: dRec?.remark || '',
          periods,
          presentCount,
          conductedCount,
          percentage: pct
        };
      });

      const totalStudents = students.length || 20;
      const dayPct = totalStudents > 0 ? Math.round((totalP / totalStudents) * 100) : 95;

      return {
        date,
        class: targetClass,
        section: targetSection,
        totalStudents,
        totalP,
        totalA,
        totalL,
        dayPercentage: dayPct,
        dailyEntry,
        periodEntries,
        students: studentRows
      };
    },

    getMonthlyReport: (month, year, cls, section = 'A') => {
      const targetClass = String(cls || '10').replace(/\D/g, '') || '10';
      const secLetters = String(section || 'A').match(/[A-Za-z]/g);
      const targetSection = secLetters ? secLetters[secLetters.length - 1].toUpperCase() : 'A';
      const students = store.students.filter(s => String(s.class) === targetClass && s.section === targetSection);

      const isHigher = ['9', '10'].includes(targetClass);
      const subjects = isHigher
        ? ['Marathi', 'English', 'Hindi', 'Algebra', 'Geometry', 'History', 'Geography', 'Science', 'Physical Education']
        : ['Marathi', 'English', 'Hindi', 'Mathematics', 'History', 'Geography', 'Science', 'Physical Education'];

      const monthStr = `${year}-${String(month).padStart(2, '0')}`;
      const monthEntries = store.attendance.filter(a => a.date.startsWith(monthStr) && String(a.class) === targetClass && a.section === targetSection);

      const uniqueDates = [...new Set(monthEntries.map(a => a.date))];
      const workingDays = Math.max(uniqueDates.length, 24);

      let classTotalPresent = 0, classTotalPeriods = 0, defaultersCount = 0;

      const studentReports = students.map((s, idx) => {
        const isDefaulter = idx === 4 || idx === 17;

        const subjectStats = {};
        let totalAttended = 0, totalConducted = 0;

        subjects.forEach((subj, sIdx) => {
          const subjEntries = monthEntries.filter(a => a.subject === subj);
          const conducted = subj === 'Physical Education' ? 18 : 24;
          let attended = 0;

          let sampleMissed = 0;
          if (subjEntries.length > 0) {
            subjEntries.forEach(entry => {
              const r = entry.records?.find(rec => rec.id === s.id);
              if (r && (r.status === 'A' || r.status === 'L')) sampleMissed++;
            });
          }
          const baseAbsent = isDefaulter ? 7 + ((sIdx + idx) % 3) : ((idx + sIdx) % 3 === 0 ? 1 : ((idx + sIdx) % 5 === 0 ? 2 : 0));
          const totalMissed = Math.min(conducted - 2, sampleMissed + baseAbsent);
          attended = Math.max(0, conducted - totalMissed);

          const subjPct = conducted > 0 ? Math.round((attended / conducted) * 1000) / 10 : 90;
          subjectStats[subj] = {
            conducted,
            attended,
            percentage: subjPct
          };

          totalConducted += conducted;
          totalAttended += attended;
        });

        const overallPercent = totalConducted > 0 ? Math.round((totalAttended / totalConducted) * 1000) / 10 : 90;
        if (overallPercent < 75) defaultersCount++;

        const daysPresent = Math.round((overallPercent / 100) * workingDays);
        const daysAbsent = Math.max(0, workingDays - daysPresent - 1);
        const daysLeave = Math.max(0, workingDays - daysPresent - daysAbsent);

        classTotalPresent += totalAttended;
        classTotalPeriods += totalConducted;

        return {
          studentId: s.id,
          rollNo: s.rollNo || s.id,
          name: s.name,
          gender: s.gender,
          type: s.type,
          parentName: s.parentName,
          parentPhone: s.parentPhone,
          subjects: subjectStats,
          totalConducted,
          totalAttended,
          daysPresent,
          daysAbsent,
          daysLeave,
          overallPercent,
          status: overallPercent >= 75 ? 'Satisfactory' : 'Shortage'
        };
      });

      const avgClassPct = classTotalPeriods > 0 ? Math.round((classTotalPresent / classTotalPeriods) * 1000) / 10 : 91.5;

      const classTeachers = {
        '5': 'Mrs. Vandana Sharma',
        '6': 'Mr. Prakash Kulkarni',
        '7': 'Mr. Deepak Patil',
        '8': 'Mrs. Lata Mehta',
        '9': 'Mrs. Sunita Deshpande',
        '10': 'Mr. Ramesh Gupta'
      };

      return {
        month,
        monthName: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][month - 1],
        year,
        class: targetClass,
        section: targetSection,
        className: `Class ${targetClass}-${targetSection}`,
        classTeacher: classTeachers[targetClass] || 'Class Teacher',
        subjects,
        workingDays,
        totalPeriodsConducted: Math.round(classTotalPeriods / (students.length || 1)),
        averageClassPercentage: avgClassPct,
        defaultersCount,
        studentReports
      };
    },

    getStudentRecord: (studentId, month, year) =>
      store.attendance.filter(a => {
        if (!a.records) return false;
        const d = new Date(a.date);
        return (!month || d.getMonth() + 1 == month) &&
          (!year || d.getFullYear() == year) &&
          a.records.some(r => r.id === studentId);
      }),

    calcDays: (studentId, month, year) => {
      const records = DB.attendance.getStudentRecord(studentId, month, year);
      let present = 0, absent = 0, leave = 0;
      records.forEach(a => {
        const r = (a.records || []).find(rec => rec.id === studentId);
        if (r) {
          if (r.status === 'P') present++;
          else if (r.status === 'A') absent++;
          else if (r.status === 'L') leave++;
        }
      });
      return { present, absent, leave, total: present + absent + leave };
    },

    calcPercent: (studentId) => {
      let present = 0, total = 0;
      store.attendance.forEach(a => {
        const r = (a.records || []).find(r => r.id === studentId);
        if (r) { total++; if (r.status === 'P') present++; }
      });
      return total > 0 ? Math.round((present / total) * 100) : 88.5;
    }
  },

  fees: {
    getStructure: () => store.feeStructure,
    saveStructure: (data) => { store.feeStructure = { ...store.feeStructure, ...data }; },
    getFeeForStudent: (s) => (s && s.type === 'residential' ? 50000 : 10000),
    getAllPayments: () => store.feePayments,
    getStudentPayments: (id) => store.feePayments.filter(p => p.studentId === id),
    getTotalPaid: (id) => store.feePayments.filter(p => p.studentId === id).reduce((s, p) => s + Number(p.amount || 0), 0),
    savePayment: (data) => {
      if (!data.id) {
        data.id = `RCP-${Date.now()}`;
        data.receiptNo = `RCP-${String(store.feePayments.length + 1).padStart(4, '0')}`;
        data.createdAt = new Date().toISOString();
        store.feePayments.unshift(data);
      } else {
        const idx = store.feePayments.findIndex(p => p.id === data.id);
        if (idx !== -1) store.feePayments[idx] = { ...store.feePayments[idx], ...data };
      }
      return data;
    },
    getDefaulters: () => store.students.filter(s => {
      const total = s.type === 'residential' ? 50000 : 10000;
      const paid = store.feePayments.filter(p => p.studentId === s.id).reduce((sum, p) => sum + Number(p.amount || 0), 0);
      return paid < total;
    }).map(s => {
      const total = s.type === 'residential' ? 50000 : 10000;
      const paid = store.feePayments.filter(p => p.studentId === s.id).reduce((sum, p) => sum + Number(p.amount || 0), 0);
      return { ...s, totalFee: total, paid, pending: total - paid };
    }),
    getSummary: () => {
      const dayStudents = store.students.filter(s => s.type !== 'residential');
      const resStudents = store.students.filter(s => s.type === 'residential');

      // 300 day scholars @ 10,000 + 150 residential @ 50,000 = 1,05,00,000
      const totalTarget = (300 * 10000) + (150 * 50000);
      const totalCollected = store.feePayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
      const totalPending = Math.max(0, totalTarget - totalCollected);

      const thisMonth = new Date().toISOString().slice(0, 7);
      const thisMonthCollected = store.feePayments
        .filter(p => p.date && p.date.startsWith(thisMonth))
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);

      const defaulters = DB.fees.getDefaulters();

      return {
        totalTarget,
        totalCollected,
        totalPending,
        thisMonthCollected,
        defaultersCount: defaulters.length,
        dayScholars: {
          feePerStudent: 10000,
          sampleCount: dayStudents.length,
          projectedCount: 300,
          projectedTarget: 3000000
        },
        residential: {
          feePerStudent: 50000,
          sampleCount: resStudents.length,
          projectedCount: 150,
          projectedTarget: 7500000
        }
      };
    }
  },

  results: {
    GRADES: [
      { min: 90, grade: 'A+', remark: 'Excellent' },
      { min: 75, grade: 'A', remark: 'Very Good' },
      { min: 60, grade: 'B', remark: 'Good' },
      { min: 45, grade: 'C', remark: 'Average' },
      { min: 33, grade: 'D', remark: 'Below Average' },
      { min: 0, grade: 'F', remark: 'Fail' }
    ],
    getGrade: (pct) => {
      const GRADES = [
        { min: 90, grade: 'A+', remark: 'Excellent' },
        { min: 75, grade: 'A', remark: 'Very Good' },
        { min: 60, grade: 'B', remark: 'Good' },
        { min: 45, grade: 'C', remark: 'Average' },
        { min: 33, grade: 'D', remark: 'Below Average' },
        { min: 0, grade: 'F', remark: 'Fail' }
      ];
      return GRADES.find(g => pct >= g.min) || GRADES[GRADES.length - 1];
    },
    getAll: () => store.results,
    getByStudent: (id) => store.results.filter(r => r.studentId === id),
    getClassResults: (cls, sec, exam, year) =>
      store.results.filter(r => r.class == cls && r.section === sec && r.exam === exam && r.year == year),
    save: (data) => {
      const key = `${data.studentId}_${data.exam}_${data.year}`;
      const subjectList = Object.entries(data.subjects || {});
      const hasDirectTotal = data.total !== undefined && data.total !== null && data.total !== '';
      const total = hasDirectTotal
        ? Number(data.total)
        : subjectList.reduce((s, [, m]) => s + Number(m || 0), 0);
      const maxTotal = Number(data.maxTotal) || (subjectList.length > 0 ? subjectList.length * 100 : 600);
      const pct = data.percentage !== undefined && data.percentage !== null && data.percentage !== ''
        ? Number(data.percentage)
        : (maxTotal > 0 ? Math.round((total / maxTotal) * 10000) / 100 : 0);
      const gradeInfo = DB.results.getGrade(pct);
      const entry = {
        ...data,
        key,
        total,
        maxTotal,
        percentage: pct,
        grade: data.grade || gradeInfo.grade,
        remark: data.remark || gradeInfo.remark,
        pass: pct >= 33,
        savedAt: new Date().toISOString()
      };
      const idx = store.results.findIndex(r => r.key === key);
      if (idx !== -1) store.results[idx] = entry;
      else store.results.push(entry);

      try {
        Result.findOneAndUpdate({ key }, entry, { upsert: true }).catch(() => { });
      } catch { }

      return entry;
    }
  },

  hostel: {
    getRooms: () => store.hostelRooms,
    getRoom: (no) => store.hostelRooms.find(r => r.roomNo === no),
    saveRoom: (data) => {
      const idx = store.hostelRooms.findIndex(r => r.roomNo === data.roomNo);
      if (idx !== -1) store.hostelRooms[idx] = { ...store.hostelRooms[idx], ...data };
      else store.hostelRooms.push({ students: [], ...data });
    },
    deleteRoom: (no) => { store.hostelRooms = store.hostelRooms.filter(r => r.roomNo !== no); },
    allocate: (roomNo, sid) => {
      const room = store.hostelRooms.find(r => r.roomNo === roomNo);
      if (!room || room.students.includes(sid) || room.students.length >= room.capacity) return false;
      room.students.push(sid);
      return true;
    },
    deallocate: (sid) => store.hostelRooms.forEach(r => { r.students = r.students.filter(id => id !== sid); }),
    getStudentRoom: (sid) => store.hostelRooms.find(r => r.students?.includes(sid)),
    getLeaves: () => store.hostelLeaves,
    saveLeave: (data) => {
      if (!data.id) { data.id = DB.genId('LV'); store.hostelLeaves.push(data); }
      else { const idx = store.hostelLeaves.findIndex(l => l.id === data.id); if (idx !== -1) store.hostelLeaves[idx] = data; }
    }
  },

  timetable: {
    getConfig: () => store.timetableConfig,
    updateConfig: (cfg) => {
      store.timetableConfig = { ...store.timetableConfig, ...cfg };
      return store.timetableConfig;
    },
    getPublished: () => store.publishedTimetable,
    getDraft: () => store.draftTimetable || store.publishedTimetable,
    saveDraft: (draft) => {
      store.draftTimetable = { ...draft, status: 'draft', updatedAt: new Date().toISOString() };
      return store.draftTimetable;
    },
    publish: (published) => {
      const pub = {
        ...published,
        status: 'published',
        version: (store.publishedTimetable?.version || 1) + 1,
        publishedAt: new Date().toISOString()
      };
      store.publishedTimetable = pub;
      store.timetables = pub.classes;
      store.draftTimetable = null;
      return pub;
    },
    get: (cls, sec, isDraft = false) => {
      const src = (isDraft && store.draftTimetable) ? store.draftTimetable : store.publishedTimetable;
      const key = `${cls}_${sec}`;
      return src?.classes?.[key] || store.timetables[`${cls}_${sec}`] || {};
    },
    save: (cls, sec, data) => {
      const key = `${cls}_${sec}`;
      if (!store.draftTimetable) {
        store.draftTimetable = JSON.parse(JSON.stringify(store.publishedTimetable || { classes: {} }));
      }
      if (!store.draftTimetable.classes) store.draftTimetable.classes = {};
      store.draftTimetable.classes[key] = data;
      store.timetables[key] = data;
    },
    getAll: () => store.publishedTimetable?.classes || store.timetables,
    getTeacherSchedule: (teacherIdentifier, isDraft = false) => {
      const src = (isDraft && store.draftTimetable) ? store.draftTimetable : store.publishedTimetable;
      if (!src || !src.classes) return {};
      const teacherGrid = {};
      const days = store.timetableConfig.workingDays;
      days.forEach(d => { teacherGrid[d] = []; });

      const target = (teacherIdentifier || '').toLowerCase().trim();

      store.timetableConfig.periods.forEach(p => {
        days.forEach(d => {
          if (p.isBreak) {
            teacherGrid[d].push({
              periodNumber: null,
              label: p.label,
              subject: p.label,
              startTime: p.startTime,
              endTime: p.endTime,
              duration: p.duration,
              room: '—',
              isBreak: true
            });
            return;
          }
          let found = null;
          Object.entries(src.classes).forEach(([clsKey, dayMap]) => {
            const slot = (dayMap[d] || []).find(s => s.periodNumber === p.periodNumber);
            if (slot && (
              (slot.teacherId && slot.teacherId.toLowerCase() === target) ||
              (slot.teacherName && slot.teacherName.toLowerCase() === target) ||
              (slot.teacherName && slot.teacherName.toLowerCase().includes(target))
            )) {
              found = { ...slot, classKey: clsKey };
            }
          });
          if (found) {
            teacherGrid[d].push(found);
          } else {
            teacherGrid[d].push({
              periodNumber: p.periodNumber,
              label: p.label,
              startTime: p.startTime,
              endTime: p.endTime,
              duration: p.duration,
              isBreak: false,
              isFree: true,
              subject: 'Free Period',
              teacherId: '',
              teacherName: '',
              room: 'Staff Room'
            });
          }
        });
      });
      return teacherGrid;
    }
  },

  notices: {
    getAll: () => [...store.notices].sort((a, b) => new Date(b.date) - new Date(a.date)),
    getRecent: (n) => [...store.notices].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, n),
    save: (data) => {
      if (!data.id) { data.id = DB.genId('N'); data.date = data.date || new Date().toISOString().slice(0, 10); store.notices.push(data); }
      else { const idx = store.notices.findIndex(n => n.id === data.id); if (idx !== -1) store.notices[idx] = data; }
      return data;
    },
    delete: (id) => { store.notices = store.notices.filter(n => n.id !== id); }
  },

  achievements: {
    getAll: () => store.achievements,
    save: (data) => {
      if (!data.id) { data.id = DB.genId('ACH'); store.achievements.push(data); }
      else { const idx = store.achievements.findIndex(a => a.id === data.id); if (idx !== -1) store.achievements[idx] = data; }
      return data;
    },
    delete: (id) => { store.achievements = store.achievements.filter(a => a.id !== id); }
  },

  sports: {
    getAll: () => store.sports,
    save: (data) => {
      if (!data.id) { data.id = DB.genId('SPT'); store.sports.push(data); }
      else { const idx = store.sports.findIndex(s => s.id === data.id); if (idx !== -1) store.sports[idx] = data; }
      return data;
    },
    delete: (id) => { store.sports = store.sports.filter(s => s.id !== id); }
  },

  mess: {
    getMenu: () => store.messMenu,
    saveMenu: (data) => { store.messMenu = data; }
  },

  medical: {
    getAll: () => store.medical,
    getByStudent: (id) => store.medical.filter(m => m.studentId === id),
    save: (data) => {
      if (!data.id) { data.id = DB.genId('MED'); data.createdAt = new Date().toISOString(); store.medical.push(data); }
      else { const idx = store.medical.findIndex(m => m.id === data.id); if (idx !== -1) store.medical[idx] = data; }
      return data;
    },
    delete: (id) => { store.medical = store.medical.filter(m => m.id !== id); }
  },

  expenses: {
    getAll: () => store.expenses,
    getByStudent: (id) => store.expenses.filter(e => e.studentId === id),
    save: (data) => {
      if (!data.id) { data.id = DB.genId('EXP'); data.createdAt = new Date().toISOString(); store.expenses.push(data); }
      else { const idx = store.expenses.findIndex(e => e.id === data.id); if (idx !== -1) store.expenses[idx] = data; }
      return data;
    },
    delete: (id) => { store.expenses = store.expenses.filter(e => e.id !== id); }
  },

  teacherLeave: {
    getAll: () => store.teacherLeave,
    save: (data) => {
      if (!data.id) { data.id = DB.genId('TL'); data.appliedAt = new Date().toISOString(); store.teacherLeave.push(data); }
      else { const idx = store.teacherLeave.findIndex(t => t.id === data.id); if (idx !== -1) store.teacherLeave[idx] = data; }
      return data;
    },
    delete: (id) => { store.teacherLeave = store.teacherLeave.filter(t => t.id !== id); }
  },

  mentor: {
    getAll: () => store.mentor,
    save: (data) => {
      if (!data.id) { data.id = DB.genId('MTR'); store.mentor.push(data); }
      else { const idx = store.mentor.findIndex(m => m.id === data.id); if (idx !== -1) store.mentor[idx] = data; }
      return data;
    },
    delete: (id) => { store.mentor = store.mentor.filter(m => m.id !== id); },
    getCalls: () => store.mentorCalls || [],
    getCallsByStudent: (stuId) => (store.mentorCalls || []).filter(c => c.studentId === stuId),
    saveCall: (data) => {
      if (!data.id) { data.id = 'CALL-' + Date.now().toString().slice(-4); }
      store.mentorCalls.unshift(data);
      return data;
    },
    getRollCall: (wingId, date) => {
      const key = `${date}_${wingId}`;
      return store.nightRollCalls[key] || null;
    },
    saveRollCall: (wingId, date, data) => {
      const key = `${date}_${wingId}`;
      store.nightRollCalls[key] = {
        ...data,
        wingId,
        date,
        verifiedAt: new Date().toISOString()
      };
      // Also update mentor last roll call status
      const mentor = store.mentor.find(m => m.id === wingId || m.name === data.mentorName);
      if (mentor) {
        mentor.activeRollCall = `Verified (${data.presentCount || data.records?.length || 0} Present)`;
        mentor.lastRollCallTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }

      // Automatically sync into central attendance store so it reflects across Attendance Analytics and Parent Dossier!
      if (Array.isArray(data.records) && data.records.length > 0) {
        const attRecords = data.records.map(r => ({
          id: r.id,
          status: r.status === 'present' ? 'P' : r.status === 'leave' ? 'L' : 'A'
        }));
        DB.attendance.save('hostel', wingId, date, 'hostel', attRecords);
      }

      return store.nightRollCalls[key];
    }
  }
};