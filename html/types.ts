
import type { LucideIcon } from 'lucide-react';

export enum AppType {
    PHONE = 'phone',
    MESSAGES = 'messages',
    MUSIC = 'music',
    SETTINGS = 'settings',
    MARKETPLACE = 'marketplace',
    SOCIAL = 'social',
    
    // iOS Style Apps
    BROWSER = 'browser',
    CAMERA = 'camera',
    PHOTOS = 'photos',
    CLOCK = 'clock',
    MAIL = 'mail',
    WEATHER = 'weather',
    MAPS = 'maps',
    NOTES = 'notes',
    REMINDERS = 'reminders',
    STOCKS = 'stocks',
    HEALTH = 'health',
    WALLET = 'wallet',

    // Custom Functional Apps
    GARAGE = 'garage',
    BANK = 'bank',
    BUSINESSES = 'businesses',
    DISPATCH = 'dispatch',

    // Job-Specific Apps
    MDT = 'mdt',
    MEDITAB = 'meditab',
    MECHATAB = 'mechatab'
}

export interface AppInfo {
    id: AppType;
    name: string; // This is a translation key
    icon: LucideIcon;
    color: string;
    bgColor?: string;
    notificationCount?: number;
    isRemovable: boolean;
    requiredJobs?: string[];
}

export interface SocialPost {
    id: string;
    authorName: string;
    authorAvatarUrl: string;
    imageUrl: string;
    caption: string;
    likes: number;
    isLiked: boolean; // Client-side state
    timestamp: string; // e.g., "5m", "2h", "1d"
}

export interface Wallpaper {
    id: string;
    name: string;
    url: string;
    isCustom?: boolean;
}

export interface PhoneSettings {
    theme: 'light' | 'dark';
    airplaneMode: boolean;
}

export interface UserData {
    id: number;
    identifier: string;
    phone_number: string;
    email?: string;
    job: string;
    onduty: boolean;
    wallpaper: string;
    language: 'en' | 'fr';
    installed_apps: string; // JSON string of AppType[]
    dock_order: string; // JSON string of AppType[]
    settings: string; // JSON string of PhoneSettings
}

export interface Message {
    id: number;
    content: string;
    timestamp: string; // Pre-formatted string
    isSender: boolean;
}

export interface Conversation {
    contactName: string;
    phoneNumber: string;
    messages: Message[];
    lastMessage: string;
    timestamp: string; // Pre-formatted string
    unread: number;
    avatarUrl?: string;
}

export interface Contact {
    id: string;
    name: string;
    phoneNumber: string;
    avatarUrl?: string;
}

export enum CallDirection {
    INCOMING = 'incoming',
    OUTGOING = 'outgoing',
    MISSED = 'missed',
}

export interface CallRecord {
    id: number;
    contact: Contact; // Embed the contact object
    direction: CallDirection;
    timestamp: string; // Pre-formatted string
    isNew?: boolean;
}

export enum DispatchDepartment {
    POLICE = 'police',
    AMBULANCE = 'ambulance',
    FIRE = 'fire',
    CITIZEN = 'citizen',
}

export interface DispatchDepartmentInfo {
    color: string;
    icon: LucideIcon;
}

export interface DispatchAlert {
    id: number;
    department: DispatchDepartment;
    title: string;
    details: string;
    timestamp: string;
    location: string;
}

export interface Song {
    id: string;
    title: string;
    artist: string;
    url: string;
}

// Types for weather data from wttr.in
export interface WeatherCondition {
    value: string;
}

export interface WeatherDataPoint {
    temp_C: string;
    temp_F: string;
    weatherDesc: WeatherCondition[];
    weatherCode: string;
    time?: string;
}

export interface WeatherDay {
    date: string;
    maxtemp_C: string;
    maxtemp_F: string;
    mintemp_C: string;
    mintemp_F: string;
    hourly: WeatherDataPoint[];
}

export interface WeatherInfo {
    current_condition: WeatherDataPoint[];
    weather: WeatherDay[];
}

// Vehicle App Types
export enum VehicleStatus {
    GARAGED = 'garaged',
    IMPOUNDED = 'impounded',
    OUT = 'out',
}

export interface Vehicle {
    id: string;
    name: string;
    plate: string;
    status: VehicleStatus;
    imageUrl?: string;
}

// Bank App Types
export interface Transaction {
    id: string;
    date: string;
    description: string;
    amount: number;
    type: 'credit' | 'debit';
}

export interface BankAccount {
    balance: number;
    transactions: Transaction[];
}

// Business App Types
export interface Business {
    id: string;
    name: string;
    type: string;
    owner: string;
    logoUrl: string;
    description: string;
    location: { x: number; y: number; z: number };
}

// Mail App Types
export interface Mail {
    id: string;
    from: string;
    subject: string;
    body: string;
    timestamp: string;
    isRead: boolean;
}

// Job-Specific App Types

export interface OnDutyUnit {
    identifier: string;
    name: string;
    pos: { x: number, y: number, z: number };
}

// MDT
export interface MdtCitizen {
    identifier: string;
    name:string;
    dateofbirth: string;
    gender: 'Male' | 'Female' | 'Other';
    image_url: string;
    phone_number: string;
    incidents?: MdtIncident[];
    licenses?: any[]; // Define later
    vehicles?: Vehicle[];
}

export interface MdtIncident {
    id: number;
    title: string;
    timestamp: string;
    officers_involved: string; // JSON array of names
    civilians_involved: string; // JSON array of names
    reports: MdtReport[];
}

export interface MdtReport {
    id: number;
    author: string;
    timestamp: string;
    content: string;
}

// MediTab
export interface MedicalRecord {
    id: number;
    patient_identifier: string;
    timestamp: string;
    doctor: string;
    diagnosis: string;
    treatment: string;
    notes: string;
}

// MechaTab
export interface MechanicInvoice {
    id: number;
    customer_name: string;
    vehicle_plate: string;
    mechanic: string;
    timestamp: string;
    services: string; // JSON array of { name: string, price: number }
    total: number;
    is_paid: boolean;
}
