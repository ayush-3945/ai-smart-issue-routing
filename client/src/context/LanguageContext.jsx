import React, { createContext, useContext, useState, useEffect } from 'react';

export const translations = {
  en: {
    appTitle: 'SmartIssue AI',
    appSubtitle: 'Autonomous Complaint Routing System',
    adminCommandCenter: 'Admin Command Center',
    adminSubtitle: 'Autonomous AI Ingestion & SLA Operations Hub',
    userDashboard: 'User Dashboard',
    signOut: 'Sign Out',
    exportCsv: 'Export CSV',
    adminView: 'Admin View',
    userView: 'User View',
    raiseIssueTitle: 'Raise a New Issue',
    raiseIssueSubtitle: 'Describe your problem. Our Autonomous AI Engine will instantly analyze, prioritize, and route it.',
    issueTitleLabel: 'Issue Title',
    issueTitlePlaceholder: 'e.g. WiFi not connecting on 3rd floor',
    problemDescriptionLabel: 'Detailed Problem Description',
    problemDescriptionPlaceholder: 'Provide thorough context: error logs, steps to reproduce, affected services...',
    attachmentsLabel: 'Attach Documents / Screenshots (Optional, up to 5 files - Images, PDF, Docs)',
    submitButton: 'Submit Issue to AI →',
    submittingButton: 'AI Analyzing & Routing...',
    mySubmittedIssues: 'My Submitted Issues',
    noIssuesFound: 'No issues submitted yet. Fill out the form above to raise your first AI-routed issue!',
    duplicateAlertTitle: 'AI Notice: Similar Issue Already Reported!',
    duplicateAlertDesc: 'We found existing active tickets matching your problem. Please check if your issue is already being addressed:',
    dismissContinue: 'Dismiss & Continue',
    viewMatch: 'View →',
    problemDescription: 'Problem Description',
    geminiExecutiveBrief: 'AI Executive Diagnostic Brief',
    confidence: 'Confidence',
    troubleshootingPlan: 'Automated Root-Cause & Resolution Protocol',
    guidance: 'Guidance',
    insertToReply: 'Insert to Reply',
    liveResolutionThread: 'Live Resolution Thread',
    noMessagesYet: 'No messages yet. Start the conversation below to troubleshoot and resolve this issue.',
    replyPlaceholder: 'Type your reply, updates or troubleshooting steps...',
    sendReply: 'Send',
    attachedFiles: 'Attached Files & Evidence',
    assignedLead: 'Assigned Lead',
    totalIssues: 'Total Issues',
    pendingReview: 'Pending Review',
    inProgress: 'In Progress',
    resolvedClosed: 'Resolved / Closed',
    categoryAiDistribution: 'Category AI Distribution',
    priorityBreakdown: 'Priority Breakdown',
    sevenDayVelocity: '7-Day Velocity',
    geminiWorkloadPrediction: 'Predictive Workload & Capacity Forecast (Next 7 Days)',
    predictiveQueueIntel: 'Predictive queue intelligence forecasting department bottlenecks and surge velocity.',
    surgeRisk: 'Surge Risk',
    primarySpike: 'Primary Spike',
    executiveForecast: 'Executive Forecast',
    staffingAction: 'Staffing Action',
    searchPlaceholder: 'Search Issues by title, description or author...',
    categoryFilter: 'Category',
    all: 'All',
    activeIssuesQueue: 'Active Issues Queue',
    tableIssueDetails: 'ISSUE DETAILS',
    tableAiCategory: 'AI CATEGORY',
    tableAssignedLead: 'ASSIGNED LEAD',
    tablePriority: 'PRIORITY',
    tableConfidence: 'CONFIDENCE',
    tableLifecycleAction: 'LIFECYCLE ACTION',
    catIT: 'IT',
    catHR: 'HR',
    catFinance: 'Finance',
    catOperations: 'Operations',
    catGeneral: 'General',
    prioCritical: 'Critical',
    prioHigh: 'High',
    prioMedium: 'Medium',
    prioLow: 'Low',
    statusPending: 'Pending',
    statusInProgress: 'In Progress',
    statusResolved: 'Resolved',
    statusClosed: 'Closed'
  },
  hi: {
    appTitle: 'स्मार्ट-इश्यू AI',
    appSubtitle: 'स्वचालित शिकायत प्रबंधन एवं रूटिंग प्रणाली',
    adminCommandCenter: 'प्रशासक नियंत्रण केंद्र',
    adminSubtitle: 'AI स्वचालित विश्लेषण एवं संचालन केंद्र',
    userDashboard: 'उपयोगकर्ता डैशबोर्ड',
    signOut: 'लॉगआउट',
    exportCsv: 'CSV डाउनलोड करें',
    adminView: 'एडमिन व्यू',
    userView: 'यूजर व्यू',
    raiseIssueTitle: 'नई समस्या दर्ज करें',
    raiseIssueSubtitle: 'अपनी समस्या का विवरण दें। AI प्रणाली तुरंत विश्लेषण कर संबंधित विभाग को सौंप देगी।',
    issueTitleLabel: 'समस्या का शीर्षक',
    issueTitlePlaceholder: 'उदा. तीसरी मंजिल पर वाई-फाई कनेक्ट नहीं हो रहा है',
    problemDescriptionLabel: 'विस्तृत विवरण',
    problemDescriptionPlaceholder: 'विस्तार से बताएं: एरर लॉग्स, क्या परेशानी आ रही है, प्रभावित सेवाएं...',
    attachmentsLabel: 'दस्तावेज़ / स्क्रीनशॉट संलग्न करें (वैकल्पिक, 5 फाइलों तक - फोटो, PDF, Word)',
    submitButton: 'AI को समस्या सबमिट करें →',
    submittingButton: 'AI विश्लेषण एवं रूटिंग जारी है...',
    mySubmittedIssues: 'मेरी दर्ज की गई समस्याएं',
    noIssuesFound: 'अभी तक कोई समस्या दर्ज नहीं की गई है। नई समस्या दर्ज करने के लिए ऊपर दिए गए फॉर्म का उपयोग करें!',
    duplicateAlertTitle: '⚠️ AI सूचना: यह समस्या पहले से दर्ज है!',
    duplicateAlertDesc: 'आपकी समस्या से मेल खाते सक्रिय टिकट पहले से मौजूद हैं। कृपया जांचें कि क्या इस पर पहले से कार्य चल रहा है:',
    dismissContinue: 'खारिज करें और आगे बढ़ें',
    viewMatch: 'देखें →',
    problemDescription: 'समस्या का विवरण',
    geminiExecutiveBrief: 'AI कार्यकारी सारांश',
    confidence: 'सटीकता',
    troubleshootingPlan: 'त्वरित समाधान कार्य योजना',
    guidance: 'दिशा-निर्देश',
    insertToReply: 'उत्तर में जोड़ें',
    liveResolutionThread: 'लाइव समाधान वार्तालाप',
    noMessagesYet: 'अभी कोई संदेश नहीं है। समस्या निवारण हेतु नीचे वार्तालाप प्रारंभ करें।',
    replyPlaceholder: 'अपना उत्तर, अपडेट या समाधान चरण लिखें...',
    sendReply: 'भेजें',
    attachedFiles: 'संलग्न फाइलें व साक्ष्य',
    assignedLead: 'नियुक्त विभाग प्रमुख',
    totalIssues: 'कुल समस्याएं',
    pendingReview: 'समीक्षाधीन (Pending)',
    inProgress: 'प्रगति पर (In Progress)',
    resolvedClosed: 'समाधान हो चुका (Resolved)',
    categoryAiDistribution: 'विभाग अनुसार AI वितरण',
    priorityBreakdown: 'प्राथमिकता विश्लेषण',
    sevenDayVelocity: '7-दिवसीय गति दर',
    geminiWorkloadPrediction: 'कार्यभार एवं उछाल भविष्यवाणी (अगले 7 दिन)',
    predictiveQueueIntel: 'विभागों के कार्यभार और आगामी भीड़ का पूर्वानुमान लगाने वाला AI सिस्टम।',
    surgeRisk: 'उछाल जोखिम',
    primarySpike: 'मुख्य प्रभावित विभाग',
    executiveForecast: 'कार्यकारी पूर्वानुमान',
    staffingAction: 'प्रबंधन सुझाव',
    searchPlaceholder: 'शीर्षक, विवरण या नाम से खोजें...',
    categoryFilter: 'विभाग',
    all: 'सभी',
    activeIssuesQueue: 'सक्रिय समस्याओं की सूची',
    tableIssueDetails: 'समस्या विवरण',
    tableAiCategory: 'AI विभाग',
    tableAssignedLead: 'नियुक्त प्रमुख',
    tablePriority: 'प्राथमिकता',
    tableConfidence: 'सटीकता',
    tableLifecycleAction: 'स्थिति कार्रवाई',
    catIT: 'आईटी (IT)',
    catHR: 'मानव संसाधन (HR)',
    catFinance: 'वित्त (Finance)',
    catOperations: 'संचालन (Operations)',
    catGeneral: 'सामान्य (General)',
    prioCritical: 'अत्यंत गंभीर',
    prioHigh: 'उच्च (High)',
    prioMedium: 'मध्यम (Medium)',
    prioLow: 'सामान्य (Low)',
    statusPending: 'लंबित (Pending)',
    statusInProgress: 'प्रगति पर (In Progress)',
    statusResolved: 'हल हो गया (Resolved)',
    statusClosed: 'बंद (Closed)'
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('smart_issue_lang') || 'en';
  });

  const toggleLang = (selectedLang) => {
    const newLang = selectedLang || (lang === 'en' ? 'hi' : 'en');
    setLang(newLang);
    localStorage.setItem('smart_issue_lang', newLang);
  };

  const t = (key) => {
    return translations[lang]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
