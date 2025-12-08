import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
        {/* Title */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Terms of Use
          </h1>
          <p className="text-slate-400">
            <strong>Version 1.0</strong>
          </p>
          <p className="text-slate-400 mt-2">
            Last revised: December 8, 2025
          </p>
        </div>

        {/* Terms Content */}
        <div className="prose prose-invert prose-slate max-w-none">
          {/* Introduction */}
          <div className="mb-8 p-6 bg-slate-900/50 border border-slate-800 rounded-lg">
            <p className="text-slate-300 leading-relaxed">
              The website located at <strong>www.sensybull.com</strong> (the &quot;Site&quot;) is a copyrighted work 
              belonging to Sensybull, LLC (&quot;Company&quot;, &quot;us&quot;, &quot;our&quot;, and &quot;we&quot;). Certain features of the Site 
              may be subject to additional guidelines, terms, or rules, which will be posted on the Site in 
              connection with such features. All such additional terms, guidelines, and rules are incorporated 
              by reference into these Terms.
            </p>
            <p className="text-slate-300 leading-relaxed mt-4">
              These Terms of Use (these &quot;Terms&quot;) set forth the legally binding terms and conditions that govern 
              your use of the Site. By accessing or using the Site, you are accepting these Terms (on behalf of 
              yourself or the entity that you represent), and you represent and warrant that you have the right, 
              authority, and capacity to enter into these Terms (on behalf of yourself or the entity that you 
              represent). You may not access or use the Site or accept the Terms if you are not at least 18 years 
              old. If you do not agree with all of the provisions of these Terms, do not access and/or use the Site.
            </p>
          </div>

          {/* Important Notice */}
          <div className="mb-8 p-6 bg-red-900/20 border border-red-900/50 rounded-lg">
            <p className="text-red-300 font-semibold mb-4">
              IMPORTANT NOTICE REGARDING ARBITRATION
            </p>
            <p className="text-red-200 text-sm leading-relaxed mb-3">
              PLEASE BE AWARE THAT SECTION 8.2 CONTAINS PROVISIONS GOVERNING HOW TO RESOLVE DISPUTES BETWEEN 
              YOU AND COMPANY. AMONG OTHER THINGS, SECTION 8.2 INCLUDES AN AGREEMENT TO ARBITRATE WHICH REQUIRES, 
              WITH LIMITED EXCEPTIONS, THAT ALL DISPUTES BETWEEN YOU AND US SHALL BE RESOLVED BY BINDING AND FINAL 
              ARBITRATION. SECTION 8.2 ALSO CONTAINS A CLASS ACTION AND JURY TRIAL WAIVER. PLEASE READ SECTION 8.2 
              CAREFULLY.
            </p>
            <p className="text-red-200 text-sm leading-relaxed">
              UNLESS YOU OPT OUT OF THE AGREEMENT TO ARBITRATE WITHIN 30 DAYS: (1) YOU WILL ONLY BE PERMITTED TO 
              PURSUE DISPUTES OR CLAIMS AND SEEK RELIEF AGAINST US ON AN INDIVIDUAL BASIS, NOT AS A PLAINTIFF OR 
              CLASS MEMBER IN ANY CLASS OR REPRESENTATIVE ACTION OR PROCEEDING AND YOU WAIVE YOUR RIGHT TO PARTICIPATE 
              IN A CLASS ACTION LAWSUIT OR CLASS-WIDE ARBITRATION; AND (2) YOU ARE WAIVING YOUR RIGHT TO PURSUE 
              DISPUTES OR CLAIMS AND SEEK RELIEF IN A COURT OF LAW AND TO HAVE A JURY TRIAL.
            </p>
          </div>

          {/* Section 1: Accounts */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-white">1. Accounts</h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3 text-slate-200">1.1 Account Creation</h3>
              <p className="text-slate-300 leading-relaxed">
                In order to use certain features of the Site, you must register for an account (&quot;Account&quot;) and 
                provide certain information about yourself as prompted by the account registration form. You 
                represent and warrant that: (a) all required registration information you submit is truthful and 
                accurate; (b) you will maintain the accuracy of such information. You may delete your Account at 
                any time, for any reason, by following the instructions on the Site. Company may suspend or terminate 
                your Account in accordance with Section 7.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3 text-slate-200">1.2 Account Responsibilities</h3>
              <p className="text-slate-300 leading-relaxed">
                You are responsible for maintaining the confidentiality of your Account login information and are 
                fully responsible for all activities that occur under your Account. You agree to immediately notify 
                Company of any unauthorized use, or suspected unauthorized use of your Account or any other breach 
                of security. Company cannot and will not be liable for any loss or damage arising from your failure 
                to comply with the above requirements.
              </p>
            </div>
          </section>

          {/* Section 2: Access to the Site */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-white">2. Access to the Site</h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3 text-slate-200">2.1 License</h3>
              <p className="text-slate-300 leading-relaxed">
                Subject to these Terms, Company grants you a non-transferable, non-exclusive, revocable, limited 
                license to use and access the Site solely for your own personal, noncommercial use.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3 text-slate-200">2.2 Certain Restrictions</h3>
              <p className="text-slate-300 leading-relaxed mb-3">
                The rights granted to you in these Terms are subject to the following restrictions:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>You shall not license, sell, rent, lease, transfer, assign, distribute, host, or otherwise commercially exploit the Site</li>
                <li>You shall not modify, make derivative works of, disassemble, reverse compile or reverse engineer any part of the Site</li>
                <li>You shall not access the Site in order to build a similar or competitive website, product, or service</li>
                <li>No part of the Site may be copied, reproduced, distributed, republished, downloaded, displayed, posted or transmitted in any form or by any means</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3 text-slate-200">2.3 Modification</h3>
              <p className="text-slate-300 leading-relaxed">
                Company reserves the right, at any time, to modify, suspend, or discontinue the Site (in whole or in part) 
                with or without notice to you. You agree that Company will not be liable to you or to any third party for 
                any modification, suspension, or discontinuation of the Site or any part thereof.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3 text-slate-200">2.4 No Support or Maintenance</h3>
              <p className="text-slate-300 leading-relaxed">
                You acknowledge and agree that Company will have no obligation to provide you with any support or maintenance 
                in connection with the Site.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3 text-slate-200">2.5 Ownership</h3>
              <p className="text-slate-300 leading-relaxed">
                You acknowledge that all the intellectual property rights, including copyrights, patents, trade marks, and 
                trade secrets, in the Site and its content are owned by Company or Company&apos;s suppliers. Neither these Terms 
                (nor your access to the Site) transfers to you or any third party any rights, title or interest in or to such 
                intellectual property rights, except for the limited access rights expressly set forth in Section 2.1.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3 text-slate-200">2.6 Feedback</h3>
              <p className="text-slate-300 leading-relaxed">
                If you provide Company with any feedback or suggestions regarding the Site (&quot;Feedback&quot;), you hereby assign 
                to Company all rights in such Feedback and agree that Company shall have the right to use and fully exploit 
                such Feedback and related information in any manner it deems appropriate. Company will treat any Feedback you 
                provide to Company as non-confidential and non-proprietary.
              </p>
            </div>
          </section>

          {/* Section 3: Indemnification */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-white">3. Indemnification</h2>
            <p className="text-slate-300 leading-relaxed">
              You agree to indemnify and hold Company (and its officers, employees, and agents) harmless, including costs 
              and attorneys&apos; fees, from any claim or demand made by any third party due to or arising out of (a) your use 
              of the Site, (b) your violation of these Terms or (c) your violation of applicable laws or regulations. Company 
              reserves the right, at your expense, to assume the exclusive defense and control of any matter for which you are 
              required to indemnify us, and you agree to cooperate with our defense of these claims.
            </p>
          </section>

          {/* Section 4: Third-Party Links */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-white">4. Third-Party Links & Ads; Other Users</h2>
            <p className="text-slate-300 leading-relaxed">
              The Site may contain links to third-party websites and services, and/or display advertisements for third parties. 
              Such Third-Party Links & Ads are not under the control of Company, and Company is not responsible for any 
              Third-Party Links & Ads. Company provides access to these Third-Party Links & Ads only as a convenience to you, 
              and does not review, approve, monitor, endorse, warrant, or make any representations with respect to Third-Party 
              Links & Ads. You use all Third-Party Links & Ads at your own risk.
            </p>
          </section>

          {/* Contact Information */}
          <section className="mb-12 p-6 bg-slate-900/50 border border-slate-800 rounded-lg">
            <h2 className="text-2xl font-bold mb-6 text-white">Contact Information</h2>
            <div className="text-slate-300 space-y-2">
              <p><strong>Soham Siddhesh Jain</strong></p>
              <p>394 Baldwin Ave, Apt 1</p>
              <p>Jersey City, New Jersey 07306</p>
              <p>Telephone: (551) 399-4727</p>
              <p>Email: <a href="mailto:info@sensybull.com" className="text-blue-400 hover:text-blue-300">info@sensybull.com</a></p>
            </div>
          </section>

          {/* Copyright Notice */}
          <div className="mt-12 pt-8 border-t border-slate-800 text-center text-slate-400">
            <p>Copyright © 2025 Sensybull, LLC. All rights reserved.</p>
          </div>
        </div>
      </main>
    </div>
  );
}