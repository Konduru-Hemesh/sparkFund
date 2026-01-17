import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Idea from '../models/Idea.js';
import connectDB from '../config/database.js';

dotenv.config();

// Sample fake data
const fakeUsers = [
  {
    name: 'Sarah Chen',
    email: 'sarah.chen@example.com',
    password: 'password123',
    userType: 'innovator',
    bio: 'Tech entrepreneur passionate about AI and healthcare innovations.',
    location: 'San Francisco, CA',
    company: 'TechVentures Inc.',
    expertise: ['AI', 'Healthcare', 'Machine Learning'],
  },
  {
    name: 'Michael Rodriguez',
    email: 'michael.r@example.com',
    password: 'password123',
    userType: 'investor',
    bio: 'Angel investor focused on early-stage tech startups.',
    location: 'New York, NY',
    company: 'Capital Partners',
    sectorsOfInterest: ['technology', 'finance', 'enterprise'],
    investmentRange: { min: 10000, max: 500000 },
    totalInvestments: 12,
    successfulInvestments: 8,
    reputationScore: 95,
  },
  {
    name: 'Emily Watson',
    email: 'emily.w@example.com',
    password: 'password123',
    userType: 'innovator',
    bio: 'Healthcare entrepreneur building the future of telemedicine.',
    location: 'Boston, MA',
    company: 'HealthTech Solutions',
    expertise: ['Healthcare', 'Telemedicine', 'Digital Health'],
  },
  {
    name: 'David Kim',
    email: 'david.kim@example.com',
    password: 'password123',
    userType: 'investor',
    bio: 'VC investor specializing in consumer and enterprise solutions.',
    location: 'Seattle, WA',
    company: 'Venture Capital Group',
    sectorsOfInterest: ['consumer', 'technology', 'enterprise'],
    investmentRange: { min: 50000, max: 1000000 },
    totalInvestments: 25,
    successfulInvestments: 18,
    reputationScore: 92,
  },
  {
    name: 'Jessica Martinez',
    email: 'jessica.m@example.com',
    password: 'password123',
    userType: 'innovator',
    bio: 'Environmental advocate building sustainable tech solutions.',
    location: 'Austin, TX',
    company: 'GreenTech Innovations',
    expertise: ['Environment', 'Sustainability', 'Clean Energy'],
  },
  {
    name: 'Robert Chen',
    email: 'robert.c@example.com',
    password: 'password123',
    userType: 'investor',
    bio: 'Serial entrepreneur turned investor, focusing on fintech.',
    location: 'Chicago, IL',
    company: 'FinTech Ventures',
    sectorsOfInterest: ['finance', 'technology', 'consumer'],
    investmentRange: { min: 25000, max: 750000 },
    totalInvestments: 18,
    successfulInvestments: 12,
    reputationScore: 88,
  },
];

const fakeIdeas = [
  {
    title: 'AI-Powered Mental Health Assistant',
    description: 'An innovative AI platform that provides 24/7 mental health support using natural language processing and cognitive behavioral therapy techniques. The platform connects users with licensed therapists when needed and offers personalized self-help tools.',
    category: 'healthcare',
    stage: 'mvp',
    fundingGoal: 250000,
    currentFunding: 125000,
    impactScore: 92,
    status: 'published',
    tags: ['AI', 'Mental Health', 'Healthcare', 'Technology'],
  },
  {
    title: 'Sustainable Food Delivery Network',
    description: 'A zero-waste food delivery platform that uses electric vehicles and compostable packaging. The platform connects local farmers directly with consumers, reducing food waste and supporting sustainable agriculture.',
    category: 'environment',
    stage: 'beta',
    fundingGoal: 500000,
    currentFunding: 350000,
    impactScore: 88,
    status: 'published',
    tags: ['Sustainability', 'Food', 'Environment', 'Logistics'],
  },
  {
    title: 'Blockchain-Based Supply Chain Tracker',
    description: 'A transparent supply chain management system using blockchain technology to track products from origin to consumer. Helps companies ensure ethical sourcing and reduce fraud.',
    category: 'technology',
    stage: 'prototype',
    fundingGoal: 750000,
    currentFunding: 200000,
    impactScore: 85,
    status: 'published',
    tags: ['Blockchain', 'Supply Chain', 'Enterprise', 'Technology'],
  },
  {
    title: 'Financial Literacy Platform for Teens',
    description: 'An interactive educational platform that teaches financial literacy to teenagers through gamification. Covers budgeting, investing, credit, and financial planning in an engaging way.',
    category: 'education',
    stage: 'mvp',
    fundingGoal: 150000,
    currentFunding: 95000,
    impactScore: 90,
    status: 'published',
    tags: ['Education', 'Finance', 'Teenagers', 'Gamification'],
  },
  {
    title: 'Smart Home Energy Management System',
    description: 'An IoT-based energy management system that optimizes home energy consumption using AI. Reduces electricity bills by up to 30% and helps homeowners reduce their carbon footprint.',
    category: 'environment',
    stage: 'beta',
    fundingGoal: 400000,
    currentFunding: 280000,
    impactScore: 87,
    status: 'published',
    tags: ['IoT', 'Energy', 'Smart Home', 'Sustainability'],
  },
  {
    title: 'Remote Team Collaboration Platform',
    description: 'A comprehensive platform for remote teams featuring video conferencing, project management, and real-time collaboration tools. Designed specifically for distributed workforces.',
    category: 'enterprise',
    stage: 'launched',
    fundingGoal: 1000000,
    currentFunding: 850000,
    impactScore: 83,
    status: 'published',
    tags: ['Enterprise', 'Remote Work', 'Collaboration', 'Technology'],
  },
  {
    title: 'Personalized Learning AI Tutor',
    description: 'An AI-powered tutoring system that adapts to each student\'s learning style and pace. Provides personalized lessons, practice problems, and real-time feedback for K-12 education.',
    category: 'education',
    stage: 'mvp',
    fundingGoal: 300000,
    currentFunding: 180000,
    impactScore: 91,
    status: 'published',
    tags: ['AI', 'Education', 'Personalized Learning', 'Technology'],
  },
  {
    title: 'Eco-Friendly Fashion Marketplace',
    description: 'An online marketplace exclusively for sustainable and eco-friendly fashion brands. Features carbon-neutral shipping, transparent sourcing, and supports ethical fashion brands.',
    category: 'consumer',
    stage: 'beta',
    fundingGoal: 200000,
    currentFunding: 140000,
    impactScore: 86,
    status: 'published',
    tags: ['Fashion', 'Sustainability', 'E-commerce', 'Consumer'],
  },
];

async function seedData() {
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({ email: { $in: fakeUsers.map(u => u.email) } });
    await Idea.deleteMany({ title: { $in: fakeIdeas.map(i => i.title) } });
    console.log('✅ Cleared existing data');

    // Create users
    console.log('👥 Creating users...');
    const createdUsers = [];
    
    for (const userData of fakeUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = new User({
        ...userData,
        password: hashedPassword,
      });
      const savedUser = await user.save();
      createdUsers.push(savedUser);
      console.log(`✅ Created user: ${savedUser.name} (${savedUser.userType})`);
    }

    // Get innovators and investors
    const innovators = createdUsers.filter(u => u.userType === 'innovator');
    const investors = createdUsers.filter(u => u.userType === 'investor');

    // Create ideas
    console.log('💡 Creating ideas...');
    const createdIdeas = [];
    
    for (let i = 0; i < fakeIdeas.length; i++) {
      const ideaData = fakeIdeas[i];
      const creator = innovators[i % innovators.length]; // Distribute ideas among innovators
      
      // Add some investments from investors
      const investments = [];
      if (investors.length > 0 && Math.random() > 0.3) {
        const numInvestors = Math.floor(Math.random() * investors.length) + 1;
        const selectedInvestors = investors.slice(0, numInvestors);
        
        selectedInvestors.forEach(investor => {
          const amount = Math.floor(Math.random() * (ideaData.fundingGoal * 0.3)) + 10000;
          investments.push({
            investor: investor._id,
            amount: amount,
            investedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date in last 30 days
          });
        });
      }

      const idea = new Idea({
        ...ideaData,
        creator: creator._id,
        investments: investments,
        views: Math.floor(Math.random() * 1000) + 100,
        likes: innovators.slice(0, Math.floor(Math.random() * 5)).map(u => ({
          user: u._id,
          likedAt: new Date(),
        })),
      });

      const savedIdea = await idea.save();
      createdIdeas.push(savedIdea);
      console.log(`✅ Created idea: ${savedIdea.title}`);
    }

    console.log('\n✅ Seed data created successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - ${createdUsers.length} users created`);
    console.log(`   - ${createdIdeas.length} ideas created`);
    console.log(`   - ${innovators.length} innovators`);
    console.log(`   - ${investors.length} investors`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

// Run seed function
seedData();
