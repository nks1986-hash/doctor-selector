// doctors.js
// -------------------------------------------------------------
// Sample in-memory directory of doctors keyed by specialty.
// In a real deployment this would come from a database / hospital API.
// -------------------------------------------------------------

const DOCTOR_DIRECTORY = {
  Cardiologist: [
    { name: 'Dr. Aarti Mehta',     hospital: 'CityCare Heart Institute',  experience: '15 yrs', fee: 800 },
    { name: 'Dr. Rajiv Khanna',    hospital: 'Apollo Hospitals',          experience: '20 yrs', fee: 1200 },
    { name: 'Dr. Suresh Iyer',     hospital: 'Fortis Cardiac Centre',     experience: '12 yrs', fee: 700 },
  ],
  Dermatologist: [
    { name: 'Dr. Neha Sharma',     hospital: 'SkinGlow Clinic',           experience: '10 yrs', fee: 600 },
    { name: 'Dr. Imran Pasha',     hospital: 'Derma Studio',              experience: '8 yrs',  fee: 500 },
    { name: 'Dr. Priya Raman',     hospital: 'Apollo Skin & Hair',        experience: '14 yrs', fee: 750 },
  ],
  Neurologist: [
    { name: 'Dr. Vikram Joshi',    hospital: 'NeuroLife Hospital',        experience: '18 yrs', fee: 1000 },
    { name: 'Dr. Anjali Kapoor',   hospital: 'Manipal Hospitals',         experience: '11 yrs', fee: 850 },
  ],
  Gastroenterologist: [
    { name: 'Dr. Sandeep Verma',   hospital: 'GutCare Clinic',            experience: '13 yrs', fee: 700 },
    { name: 'Dr. Meera Nair',      hospital: 'Fortis Digestive Centre',   experience: '9 yrs',  fee: 650 },
  ],
  Pulmonologist: [
    { name: 'Dr. Rohit Bansal',    hospital: 'BreatheWell Hospital',      experience: '12 yrs', fee: 750 },
    { name: 'Dr. Kavya Reddy',     hospital: 'Apollo Chest Centre',       experience: '10 yrs', fee: 700 },
  ],
  Orthopedist: [
    { name: 'Dr. Manish Gupta',    hospital: 'BoneCare Orthopedics',      experience: '16 yrs', fee: 800 },
    { name: 'Dr. Sneha Pillai',    hospital: 'JointCare Hospital',        experience: '9 yrs',  fee: 650 },
  ],
  Endocrinologist: [
    { name: 'Dr. Arun Subramanian',hospital: 'Endocare Clinic',           experience: '14 yrs', fee: 850 },
    { name: 'Dr. Pooja Desai',     hospital: 'Diabetes & Hormone Centre', experience: '11 yrs', fee: 700 },
  ],
  Ophthalmologist: [
    { name: 'Dr. Karthik Rao',     hospital: 'ClearVision Eye Hospital',  experience: '17 yrs', fee: 600 },
    { name: 'Dr. Shalini Bhatt',   hospital: 'EyeQ Centre',               experience: '10 yrs', fee: 500 },
  ],
  'ENT Specialist': [
    { name: 'Dr. Faisal Ahmed',    hospital: 'ENT Care Clinic',           experience: '12 yrs', fee: 600 },
    { name: 'Dr. Latha Krishnan',  hospital: 'Apollo ENT Centre',         experience: '15 yrs', fee: 750 },
  ],
  Psychiatrist: [
    { name: 'Dr. Ananya Sen',      hospital: 'MindCare Wellness',         experience: '13 yrs', fee: 1000 },
    { name: 'Dr. Devendra Naik',   hospital: 'Serenity Clinic',           experience: '9 yrs',  fee: 800 },
  ],
  Urologist: [
    { name: 'Dr. Harish Menon',    hospital: 'UroHealth Hospital',        experience: '14 yrs', fee: 850 },
    { name: 'Dr. Nisha Agarwal',   hospital: 'Fortis Urology Centre',     experience: '10 yrs', fee: 750 },
  ],
  Gynecologist: [
    { name: 'Dr. Ritu Saxena',     hospital: 'Womens Wellness Centre',    experience: '16 yrs', fee: 800 },
    { name: 'Dr. Preeti Joshi',    hospital: 'Cloudnine Hospital',        experience: '12 yrs', fee: 900 },
  ],
  Pediatrician: [
    { name: 'Dr. Aditya Rao',      hospital: 'KidsCare Clinic',           experience: '11 yrs', fee: 600 },
    { name: 'Dr. Swathi Hegde',    hospital: 'Rainbow Childrens Hospital',experience: '14 yrs', fee: 750 },
  ],
  Oncologist: [
    { name: 'Dr. Prakash Iyer',    hospital: 'OncoCare Institute',        experience: '20 yrs', fee: 1500 },
    { name: 'Dr. Reema Chowdhury', hospital: 'Tata Cancer Centre',        experience: '17 yrs', fee: 1300 },
  ],
  Nephrologist: [
    { name: 'Dr. Sameer Khan',     hospital: 'KidneyCare Hospital',       experience: '15 yrs', fee: 950 },
    { name: 'Dr. Tanvi Shah',      hospital: 'Apollo Nephrology Centre',  experience: '11 yrs', fee: 800 },
  ],
  Rheumatologist: [
    { name: 'Dr. Mohan Pillai',    hospital: 'JointCare Rheumatology',    experience: '13 yrs', fee: 800 },
    { name: 'Dr. Geeta Iyer',      hospital: 'Fortis Rheumatology',       experience: '10 yrs', fee: 700 },
  ],
  Allergist: [
    { name: 'Dr. Asha Pillai',     hospital: 'AllergyCare Centre',        experience: '9 yrs',  fee: 650 },
    { name: 'Dr. Nikhil Bhat',     hospital: 'Apollo Allergy Clinic',     experience: '12 yrs', fee: 750 },
  ],
  Dentist: [
    { name: 'Dr. Vivek Malhotra',  hospital: 'BrightSmile Dental',        experience: '10 yrs', fee: 500 },
    { name: 'Dr. Divya Kulkarni',  hospital: 'Clove Dental',              experience: '8 yrs',  fee: 450 },
  ],
  'General Physician': [
    { name: 'Dr. Ravi Shankar',    hospital: 'CityCare Polyclinic',       experience: '12 yrs', fee: 400 },
    { name: 'Dr. Anu Krishnan',    hospital: 'Apollo Family Clinic',      experience: '9 yrs',  fee: 450 },
    { name: 'Dr. Mahesh Patil',    hospital: 'HealthFirst Clinic',        experience: '15 yrs', fee: 500 },
  ],
};

/**
 * Return up to `limit` sample doctors for a given specialty.
 * Falls back to General Physician if the specialty is unknown.
 */
function getDoctorsForSpecialty(specialty, limit = 3) {
  const list =
    DOCTOR_DIRECTORY[specialty] || DOCTOR_DIRECTORY['General Physician'] || [];
  return list.slice(0, limit);
}

module.exports = { DOCTOR_DIRECTORY, getDoctorsForSpecialty };
