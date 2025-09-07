import React from 'react';
import type { TimelineStep, Case } from '../types';
import { CollectionIcon, PreservationIcon, AnalysisIcon, ReportingIcon } from '../constants';

export const timelineSteps: TimelineStep[] = [
    {
        id: 'collection',
        title: 'Evidence Collection',
        // FIX: Directly assign the component function instead of creating a new component with JSX in a .ts file.
        Icon: CollectionIcon,
        explanation: 'The first step is to identify and collect potential digital evidence from sources like computers, mobile phones, and servers. This must be done in a way that is forensically sound, meaning the original data is not altered.',
        scenario: 'An employee is suspected of leaking company data. A forensic examiner creates a bit-for-bit copy (forensic image) of the employee\'s hard drive and collects their company-issued mobile phone.',
        tools: ['FTK Imager', 'EnCase Forensic Imager', 'dd (Linux command)', 'Write Blockers'],
    },
    {
        id: 'preservation',
        title: 'Preservation',
        // FIX: Directly assign the component function instead of creating a new component with JSX in a .ts file.
        Icon: PreservationIcon,
        explanation: 'After collection, the evidence must be securely preserved to maintain its integrity. This involves creating a chain of custody document and verifying data integrity using hash values (like MD5 or SHA-256).',
        scenario: 'The forensic image of the hard drive is verified by comparing its hash value to the original drive. The image is stored in a secure evidence locker, and all access is logged in the chain of custody form.',
        tools: ['HashCalc', 'certutil (Windows command)', 'sha256sum (Linux command)', 'Chain of Custody Forms'],
    },
    {
        id: 'analysis',
        title: 'Analysis',
        // FIX: Directly assign the component function instead of creating a new component with JSX in a .ts file.
        Icon: AnalysisIcon,
        explanation: 'Examiners use specialized tools to analyze the collected data. This can involve recovering deleted files, searching for keywords, examining system logs, and identifying user activity.',
        scenario: 'Using forensic software, the examiner analyzes the hard drive image. They discover fragments of deleted emails to a competitor, browser history showing visits to file-sharing websites, and USB device connection logs.',
        tools: ['Autopsy', 'Magnet AXIOM', 'Cellebrite UFED', 'Wireshark', 'Volatility'],
    },
    {
        id: 'reporting',
        title: 'Reporting',
        // FIX: Directly assign the component function instead of creating a new component with JSX in a .ts file.
        Icon: ReportingIcon,
        explanation: 'The final step is to document the findings in a clear, concise, and technically accurate report. The report should detail the steps taken, the evidence found, and the conclusions drawn by the examiner.',
        scenario: 'The examiner writes a comprehensive report detailing the evidence of data exfiltration. The report includes timestamps, copies of the recovered emails, and a timeline of the suspect\'s actions. This report is then presented to legal counsel.',
        tools: ['Microsoft Word / Excel', 'Case Management Software', 'FTK Report Generator'],
    },
];

export const cases: Case[] = [
    {
        id: 'case-1',
        title: 'The Phishing Scheme at FinCorp',
        incidentType: 'Phishing',
        summary: 'An investigation into a targeted phishing attack that led to unauthorized access to the company\'s financial systems.',
        outcome: 'The entry point was identified as a malicious email attachment. The affected accounts were secured, and the attacker\'s C2 server was identified and reported.',
        details: 'Employees reported receiving an urgent email from "IT Support" with a PDF attachment. Analysis of an employee\'s machine showed that opening the PDF executed a PowerShell script, which downloaded a Remote Access Trojan (RAT).',
        workflow: ['Email Header Analysis', 'Malware Reverse Engineering', 'Network Traffic Analysis', 'Memory Forensics'],
        tools: ['Autopsy', 'Wireshark', 'Volatility', 'Ghidra'],
    },
    {
        id: 'case-2',
        title: 'Insider Data Theft at TechSolutions',
        incidentType: 'Insider Threat',
        summary: 'A departing employee was suspected of stealing proprietary source code before leaving the company.',
        outcome: 'Forensic analysis confirmed the employee copied large volumes of data to a personal USB drive in their final week. Legal action was initiated based on the forensic report.',
        details: 'System logs showed a large number of file access events from the employee\'s account, concentrated on the main source code repository. Analysis of their work computer revealed connection logs for an unauthorized USB device and remnants of deleted files that matched the repository contents.',
        workflow: ['Live System Analysis', 'File System Forensics', 'Windows Registry Analysis', 'Log Correlation'],
        tools: ['FTK Imager', 'Magnet AXIOM', 'RegRipper'],
    },
     {
        id: 'case-3',
        title: 'Mobile Device Compromise',
        incidentType: 'Mobile Device',
        summary: 'A corporate executive\'s smartphone was examined after they reported unusual behavior and battery drain.',
        outcome: 'A sophisticated piece of spyware was found on the device, exfiltrating call logs, text messages, and GPS data. The spyware was removed and the source was traced to a malicious app installed from a third-party store.',
        details: 'A full file system extraction of the mobile device was performed. The analysis focused on installed applications, running processes, and network connections. A hidden application was discovered that was communicating with a known malicious domain.',
        workflow: ['Mobile Device Acquisition', 'File System Analysis', 'Malware Analysis (Mobile)', 'Network Forensics'],
        tools: ['Cellebrite UFED', 'Autopsy', 'MobSF', 'Wireshark'],
    },
    {
        id: 'case-4',
        title: 'Ransomware Attack on a Healthcare Provider',
        incidentType: 'Malware',
        summary: 'Investigating a ransomware attack that encrypted patient records and demanded a ransom in cryptocurrency.',
        outcome: 'The initial infection vector was an exposed RDP port. The specific ransomware variant was identified, and while the data could not be decrypted without backups, the attacker\'s TTPs were documented to prevent re-infection.',
        details: 'The ransomware left a note on the server desktops. Forensic analysis of server images identified the encryption process and the lateral movement techniques used by the attacker. Network logs helped pinpoint the initial brute-force attack against the RDP server.',
        workflow: ['Live Memory Acquisition', 'Network Traffic Analysis', 'Malware Analysis', 'Log Analysis'],
        tools: ['Volatility', 'Wireshark', 'Autopsy', 'Splunk'],
    },
];