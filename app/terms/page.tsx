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
              required to indemnify us, and you agree to cooperate with our defense of these claims. You agree not to settle 
              any matter without the prior written consent of Company. Company will use reasonable efforts to notify you of 
              any such claim, action or proceeding upon becoming aware of it.
            </p>
          </section>

          {/* Section 4: Third-Party Links & Ads; Other Users */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-white">4. Third-Party Links & Ads; Other Users</h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3 text-slate-200">4.1 Third-Party Links & Ads</h3>
              <p className="text-slate-300 leading-relaxed">
                The Site may contain links to third-party websites and services, and/or display advertisements for third parties. 
                Such Third-Party Links & Ads are not under the control of Company, and Company is not responsible for any 
                Third-Party Links & Ads. Company provides access to these Third-Party Links & Ads only as a convenience to you, 
                and does not review, approve, monitor, endorse, warrant, or make any representations with respect to Third-Party 
                Links & Ads. You use all Third-Party Links & Ads at your own risk, and should apply a suitable level of caution 
                and discretion in doing so. When you click on any of the Third-Party Links & Ads, the applicable third party&apos;s 
                terms and policies apply, including the third party&apos;s privacy and data gathering practices.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3 text-slate-200">4.2 Other Users</h3>
              <p className="text-slate-300 leading-relaxed">
                Your interactions with other Site users are solely between you and such users. You agree that Company will not be 
                responsible for any loss or damage incurred as the result of any such interactions. If there is a dispute between 
                you and any Site user, we are under no obligation to become involved.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3 text-slate-200">4.3 Release</h3>
              <p className="text-slate-300 leading-relaxed mb-3">
                You hereby release and forever discharge Company (and our officers, employees, agents, successors, and assigns) 
                from, and hereby waive and relinquish, each and every past, present and future dispute, claim, controversy, 
                demand, right, obligation, liability, action and cause of action of every kind and nature (including personal 
                injuries, death, and property damage), that has arisen or arises directly or indirectly out of, or that relates 
                directly or indirectly to, the Site (including any interactions with, or act or omission of, other Site users or 
                any Third-Party Links & Ads).
              </p>
              <p className="text-slate-300 leading-relaxed text-sm bg-slate-800/30 p-4 rounded">
                IF YOU ARE A CALIFORNIA RESIDENT, YOU HEREBY WAIVE CALIFORNIA CIVIL CODE SECTION 1542 IN CONNECTION WITH THE 
                FOREGOING, WHICH STATES: &quot;A GENERAL RELEASE DOES NOT EXTEND TO CLAIMS WHICH THE CREDITOR OR RELEASING PARTY DOES 
                NOT KNOW OR SUSPECT TO EXIST IN HIS OR HER FAVOR AT THE TIME OF EXECUTING THE RELEASE, WHICH IF KNOWN BY HIM OR 
                HER MUST HAVE MATERIALLY AFFECTED HIS OR HER SETTLEMENT WITH THE DEBTOR OR RELEASED PARTY.&quot;
              </p>
            </div>
          </section>

          {/* Section 5: Disclaimers */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-white">5. Disclaimers</h2>
            <div className="p-6 bg-amber-900/20 border border-amber-900/50 rounded-lg">
              <p className="text-amber-200 text-sm leading-relaxed mb-3">
                THE SITE IS PROVIDED ON AN &quot;AS-IS&quot; AND &quot;AS AVAILABLE&quot; BASIS, AND COMPANY (AND OUR SUPPLIERS) EXPRESSLY 
                DISCLAIM ANY AND ALL WARRANTIES AND CONDITIONS OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING 
                ALL WARRANTIES OR CONDITIONS OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, QUIET ENJOYMENT, 
                ACCURACY, OR NON-INFRINGEMENT. WE (AND OUR SUPPLIERS) MAKE NO WARRANTY THAT THE SITE WILL MEET YOUR REQUIREMENTS, 
                WILL BE AVAILABLE ON AN UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE BASIS, OR WILL BE ACCURATE, RELIABLE, FREE 
                OF VIRUSES OR OTHER HARMFUL CODE, COMPLETE, LEGAL, OR SAFE. IF APPLICABLE LAW REQUIRES ANY WARRANTIES WITH RESPECT 
                TO THE SITE, ALL SUCH WARRANTIES ARE LIMITED IN DURATION TO 90 DAYS FROM THE DATE OF FIRST USE.
              </p>
              <p className="text-amber-200 text-sm leading-relaxed">
                SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF IMPLIED WARRANTIES, SO THE ABOVE EXCLUSION MAY NOT APPLY TO 
                YOU. SOME JURISDICTIONS DO NOT ALLOW LIMITATIONS ON HOW LONG AN IMPLIED WARRANTY LASTS, SO THE ABOVE LIMITATION 
                MAY NOT APPLY TO YOU.
              </p>
            </div>
          </section>

          {/* Section 6: Limitation on Liability */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-white">6. Limitation on Liability</h2>
            <div className="p-6 bg-amber-900/20 border border-amber-900/50 rounded-lg space-y-4">
              <p className="text-amber-200 text-sm leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL COMPANY (OR OUR SUPPLIERS) BE LIABLE TO YOU OR ANY 
                THIRD PARTY FOR ANY LOST PROFITS, LOST DATA, COSTS OF PROCUREMENT OF SUBSTITUTE PRODUCTS, OR ANY INDIRECT, 
                CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL OR PUNITIVE DAMAGES ARISING FROM OR RELATING TO THESE TERMS OR 
                YOUR USE OF, OR INABILITY TO USE, THE SITE, EVEN IF COMPANY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. 
                ACCESS TO, AND USE OF, THE SITE IS AT YOUR OWN DISCRETION AND RISK, AND YOU WILL BE SOLELY RESPONSIBLE FOR ANY 
                DAMAGE TO YOUR DEVICE OR COMPUTER SYSTEM, OR LOSS OF DATA RESULTING THEREFROM.
              </p>
              <p className="text-amber-200 text-sm leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, NOTWITHSTANDING ANYTHING TO THE CONTRARY CONTAINED HEREIN, OUR LIABILITY 
                TO YOU FOR ANY DAMAGES ARISING FROM OR RELATED TO THESE TERMS (FOR ANY CAUSE WHATSOEVER AND REGARDLESS OF THE 
                FORM OF THE ACTION), WILL AT ALL TIMES BE LIMITED TO A MAXIMUM OF FIFTY US DOLLARS. THE EXISTENCE OF MORE THAN 
                ONE CLAIM WILL NOT ENLARGE THIS LIMIT. YOU AGREE THAT OUR SUPPLIERS WILL HAVE NO LIABILITY OF ANY KIND ARISING 
                FROM OR RELATING TO THESE TERMS.
              </p>
              <p className="text-amber-200 text-sm leading-relaxed">
                SOME JURISDICTIONS DO NOT ALLOW THE LIMITATION OR EXCLUSION OF LIABILITY FOR INCIDENTAL OR CONSEQUENTIAL DAMAGES, 
                SO THE ABOVE LIMITATION OR EXCLUSION MAY NOT APPLY TO YOU.
              </p>
            </div>
          </section>

          {/* Section 7: Term and Termination */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-white">7. Term and Termination</h2>
            <p className="text-slate-300 leading-relaxed">
              Subject to this Section, these Terms will remain in full force and effect while you use the Site. We may suspend 
              or terminate your rights to use the Site (including your Account) at any time for any reason at our sole discretion, 
              including for any use of the Site in violation of these Terms. Upon termination of your rights under these Terms, 
              your Account and right to access and use the Site will terminate immediately. Company will not have any liability 
              whatsoever to you for any termination of your rights under these Terms, including for termination of your Account. 
              Even after your rights under these Terms are terminated, the following provisions of these Terms will remain in 
              effect: Sections 2.2 through 2.6 and Sections 3 through 8.
            </p>
          </section>

          {/* Section 8: General - This continues in the next message due to length */}
          {/* Section 8: General */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-white">8. General</h2>
            
            {/* 8.1 Changes */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-3 text-slate-200">8.1 Changes</h3>
              <p className="text-slate-300 leading-relaxed">
                These Terms are subject to occasional revision, and if we make any substantial changes, we may notify you by 
                sending you an e-mail to the last e-mail address you provided to us (if any), and/or by prominently posting 
                notice of the changes on our Site. You are responsible for providing us with your most current e-mail address. 
                In the event that the last e-mail address that you have provided us is not valid, or for any reason is not 
                capable of delivering to you the notice described above, our dispatch of the e-mail containing such notice will 
                nonetheless constitute effective notice of the changes described in the notice. Continued use of our Site 
                following notice of such changes shall indicate your acknowledgement of such changes and agreement to be bound 
                by the terms and conditions of such changes.
              </p>
            </div>

            {/* 8.2 Dispute Resolution - EXTENSIVE SECTION */}
            <div className="mb-8 p-6 bg-red-900/10 border border-red-900/30 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-slate-200">8.2 Dispute Resolution</h3>
              <p className="text-slate-300 leading-relaxed mb-6">
                Please read the following arbitration agreement in this Section (the &quot;Arbitration Agreement&quot;) carefully. 
                It requires you to arbitrate disputes with Company, its parent companies, subsidiaries, affiliates, successors 
                and assigns and all of their respective officers, directors, employees, agents, and representatives (collectively, 
                the &quot;Company Parties&quot;) and limits the manner in which you can seek relief from the Company Parties.
              </p>

              {/* 8.2(a) Applicability */}
              <div className="mb-6 pl-4 border-l-2 border-red-700">
                <h4 className="text-lg font-semibold mb-3 text-slate-200">
                  (a) Applicability of Arbitration Agreement
                </h4>
                <p className="text-slate-300 leading-relaxed mb-3">
                  You agree that any dispute between you and any of the Company Parties relating in any way to the Site, the 
                  services offered on the Site (the &quot;Services&quot;) or these Terms will be resolved by binding arbitration, rather 
                  than in court, except that (1) you and the Company Parties may assert individualized claims in small claims 
                  court if the claims qualify, remain in such court and advance solely on an individual, non-class basis; and 
                  (2) you or the Company Parties may seek equitable relief in court for infringement or other misuse of 
                  intellectual property rights (such as trademarks, trade dress, domain names, trade secrets, copyrights, and 
                  patents).
                </p>
                <p className="text-slate-300 leading-relaxed mb-3">
                  <strong>This Arbitration Agreement shall survive the expiration or termination of these Terms and shall apply, 
                  without limitation, to all claims that arose or were asserted before you agreed to these Terms or any prior 
                  version of these Terms.</strong> This Arbitration Agreement does not preclude you from bringing issues to the 
                  attention of federal, state or local agencies. Such agencies can, if the law allows, seek relief against the 
                  Company Parties on your behalf.
                </p>
                <p className="text-slate-300 leading-relaxed">
                  For purposes of this Arbitration Agreement, &quot;Dispute&quot; will also include disputes that arose or involve facts 
                  occurring before the existence of this or any prior versions of the Agreement as well as claims that may arise 
                  after the termination of these Terms.
                </p>
              </div>

              {/* 8.2(b) Informal Dispute Resolution */}
              <div className="mb-6 pl-4 border-l-2 border-red-700">
                <h4 className="text-lg font-semibold mb-3 text-slate-200">
                  (b) Informal Dispute Resolution
                </h4>
                <p className="text-slate-300 leading-relaxed mb-3">
                  There might be instances when a Dispute arises between you and Company. If that occurs, Company is committed 
                  to working with you to reach a reasonable resolution. You and Company agree that good faith informal efforts 
                  to resolve Disputes can result in a prompt, low-cost and mutually beneficial outcome. You and Company therefore 
                  agree that before either party commences arbitration against the other (or initiates an action in small claims 
                  court if a party so elects), we will personally meet and confer telephonically or via videoconference, in a 
                  good faith effort to resolve informally any Dispute covered by this Arbitration Agreement (&quot;Informal Dispute 
                  Resolution Conference&quot;). If you are represented by counsel, your counsel may participate in the conference, 
                  but you will also participate in the conference.
                </p>
                <p className="text-slate-300 leading-relaxed mb-3">
                  The party initiating a Dispute must give notice to the other party in writing of its intent to initiate an 
                  Informal Dispute Resolution Conference (&quot;Notice&quot;), which shall occur within 45 days after the other party 
                  receives such Notice, unless an extension is mutually agreed upon by the parties. Notice to Company that you 
                  intend to initiate an Informal Dispute Resolution Conference should be sent by email to: info@sensybull.com, 
                  or by regular mail to 394 Baldwin Ave, Apt 1, Jersey City, New Jersey 07306.
                </p>
                <p className="text-slate-300 leading-relaxed mb-3">
                  The Notice must include: (1) your name, telephone number, mailing address, e-mail address associated with your 
                  account (if you have one); (2) the name, telephone number, mailing address and e-mail address of your counsel, 
                  if any; and (3) a description of your Dispute.
                </p>
                <p className="text-slate-300 leading-relaxed">
                  The Informal Dispute Resolution Conference shall be individualized such that a separate conference must be held 
                  each time either party initiates a Dispute, even if the same law firm or group of law firms represents multiple 
                  users in similar cases, unless all parties agree. Engaging in the Informal Dispute Resolution Conference is a 
                  condition precedent and requirement that must be fulfilled before commencing arbitration. The statute of 
                  limitations and any filing fee deadlines shall be tolled while the parties engage in the Informal Dispute 
                  Resolution Conference process required by this section.
                </p>
              </div>

              {/* 8.2(c) Arbitration Rules and Forum */}
              <div className="mb-6 pl-4 border-l-2 border-red-700">
                <h4 className="text-lg font-semibold mb-3 text-slate-200">
                  (c) Arbitration Rules and Forum
                </h4>
                <p className="text-slate-300 leading-relaxed mb-3">
                  These Terms evidence a transaction involving interstate commerce; and notwithstanding any other provision herein 
                  with respect to the applicable substantive law, the Federal Arbitration Act, 9 U.S.C. § 1 et seq., will govern 
                  the interpretation and enforcement of this Arbitration Agreement and any arbitration proceedings. If the Informal 
                  Dispute Resolution Process described above does not resolve satisfactorily within 60 days after receipt of your 
                  Notice, you and Company agree that either party shall have the right to finally resolve the Dispute through 
                  binding arbitration.
                </p>
                <p className="text-slate-300 leading-relaxed mb-3">
                  The arbitration will be conducted by JAMS, an established alternative dispute resolution provider. Disputes 
                  involving claims and counterclaims with an amount in controversy under $250,000, not inclusive of attorneys&apos; 
                  fees and interest, shall be subject to JAMS&apos; most current version of the Streamlined Arbitration Rules and 
                  procedures; all other claims shall be subject to JAMS&apos;s most current version of the Comprehensive Arbitration 
                  Rules and Procedures. JAMS&apos;s rules are available at www.jamsadr.com or by calling JAMS at 800-352-5267.
                </p>
                <p className="text-slate-300 leading-relaxed mb-3">
                  A party who wishes to initiate arbitration must provide the other party with a request for arbitration (the 
                  &quot;Request&quot;). The Request must include: (1) the name, telephone number, mailing address, e-mail address of the 
                  party seeking arbitration and the account username (if applicable) as well as the email address associated with 
                  any applicable account; (2) a statement of the legal claims being asserted and the factual bases of those claims; 
                  (3) a description of the remedy sought and an accurate, good-faith calculation of the amount in controversy in 
                  United States Dollars; (4) a statement certifying completion of the Informal Dispute Resolution process as 
                  described above; and (5) evidence that the requesting party has paid any necessary filing fees in connection 
                  with such arbitration.
                </p>
                <p className="text-slate-300 leading-relaxed mb-3">
                  Unless you and Company otherwise agree, or the Batch Arbitration process discussed in Subsection 8.2(h) is 
                  triggered, the arbitration will be conducted in the county where you reside. Subject to the JAMS Rules, the 
                  arbitrator may direct a limited and reasonable exchange of information between the parties, consistent with 
                  the expedited nature of the arbitration.
                </p>
                <p className="text-slate-300 leading-relaxed">
                  You and Company agree that all materials and documents exchanged during the arbitration proceedings shall be 
                  kept confidential and shall not be shared with anyone except the parties&apos; attorneys, accountants, or business 
                  advisors, and then subject to the condition that they agree to keep all materials and documents exchanged during 
                  the arbitration proceedings confidential.
                </p>
              </div>

              {/* 8.2(d) Authority of Arbitrator */}
              <div className="mb-6 pl-4 border-l-2 border-red-700">
                <h4 className="text-lg font-semibold mb-3 text-slate-200">
                  (d) Authority of Arbitrator
                </h4>
                <p className="text-slate-300 leading-relaxed mb-3">
                  The arbitrator shall have exclusive authority to resolve all disputes subject to arbitration hereunder including, 
                  without limitation, any dispute related to the interpretation, applicability, enforceability or formation of this 
                  Arbitration Agreement or any portion of the Arbitration Agreement, except for the following: (1) all Disputes 
                  arising out of or relating to the subsection entitled &quot;Waiver of Class or Other Non-Individualized Relief,&quot; 
                  including any claim that all or part of such subsection is unenforceable, illegal, void or voidable, or that 
                  such subsection has been breached, shall be decided by a court of competent jurisdiction and not by an arbitrator; 
                  (2) except as expressly contemplated in the subsection entitled &quot;Batch Arbitration,&quot; all Disputes about the 
                  payment of arbitration fees shall be decided only by a court of competent jurisdiction and not by an arbitrator; 
                  (3) all Disputes about whether either party has satisfied any condition precedent to arbitration shall be decided 
                  only by a court of competent jurisdiction and not by an arbitrator; and (4) all Disputes about which version of 
                  the Arbitration Agreement applies shall be decided only by a court of competent jurisdiction and not by an 
                  arbitrator.
                </p>
                <p className="text-slate-300 leading-relaxed">
                  The arbitration proceeding will not be consolidated with any other matters or joined with any other cases or 
                  parties, except as expressly provided in the subsection entitled &quot;Batch Arbitration.&quot; The arbitrator shall 
                  have the authority to grant motions dispositive of all or part of any claim or dispute. The arbitrator shall 
                  have the authority to award monetary damages and to grant any non-monetary remedy or relief available to an 
                  individual party under applicable law, the arbitral forum&apos;s rules, and these Terms (including the Arbitration 
                  Agreement). The arbitrator shall issue a written award and statement of decision describing the essential 
                  findings and conclusions on which any award (or decision not to render an award) is based, including the 
                  calculation of any damages awarded. The award of the arbitrator is final and binding upon you and us. Judgment 
                  on the arbitration award may be entered in any court having jurisdiction.
                </p>
              </div>

              {/* 8.2(e) Waiver of Jury Trial */}
              <div className="mb-6 pl-4 border-l-2 border-red-700">
                <h4 className="text-lg font-semibold mb-3 text-slate-200">
                  (e) Waiver of Jury Trial
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  EXCEPT AS SPECIFIED IN SECTION 8.2(a) YOU AND THE COMPANY PARTIES HEREBY WAIVE ANY CONSTITUTIONAL AND STATUTORY 
                  RIGHTS TO SUE IN COURT AND HAVE A TRIAL IN FRONT OF A JUDGE OR A JURY. You and the Company Parties are instead 
                  electing that all covered claims and disputes shall be resolved exclusively by arbitration under this Arbitration 
                  Agreement, except as specified in Section 8.2(a) above. An arbitrator can award on an individual basis the same 
                  damages and relief as a court and must follow these Terms as a court would. However, there is no judge or jury 
                  in arbitration, and court review of an arbitration award is subject to very limited review.
                </p>
              </div>

              {/* 8.2(f) Waiver of Class or Other Non-Individualized Relief */}
              <div className="mb-6 pl-4 border-l-2 border-red-700">
                <h4 className="text-lg font-semibold mb-3 text-slate-200">
                  (f) Waiver of Class or Other Non-Individualized Relief
                </h4>
                <p className="text-slate-300 leading-relaxed mb-3">
                  YOU AND COMPANY AGREE THAT, EXCEPT AS SPECIFIED IN SUBSECTION 8.2(h) EACH OF US MAY BRING CLAIMS AGAINST THE 
                  OTHER ONLY ON AN INDIVIDUAL BASIS AND NOT ON A CLASS, REPRESENTATIVE, OR COLLECTIVE BASIS, AND THE PARTIES HEREBY 
                  WAIVE ALL RIGHTS TO HAVE ANY DISPUTE BE BROUGHT, HEARD, ADMINISTERED, RESOLVED, OR ARBITRATED ON A CLASS, 
                  COLLECTIVE, REPRESENTATIVE, OR MASS ACTION BASIS. ONLY INDIVIDUAL RELIEF IS AVAILABLE, AND DISPUTES OF MORE THAN 
                  ONE CUSTOMER OR USER CANNOT BE ARBITRATED OR CONSOLIDATED WITH THOSE OF ANY OTHER CUSTOMER OR USER.
                </p>
                <p className="text-slate-300 leading-relaxed mb-3">
                  Subject to this Arbitration Agreement, the arbitrator may award declaratory or injunctive relief only in favor 
                  of the individual party seeking relief and only to the extent necessary to provide relief warranted by the 
                  party&apos;s individual claim. Nothing in this paragraph is intended to, nor shall it, affect the terms and 
                  conditions under the Subsection 8.2(h) entitled &quot;Batch Arbitration.&quot;
                </p>
                <p className="text-slate-300 leading-relaxed">
                  Notwithstanding anything to the contrary in this Arbitration Agreement, if a court decides by means of a final 
                  decision, not subject to any further appeal or recourse, that the limitations of this subsection are invalid or 
                  unenforceable as to a particular claim or request for relief (such as a request for public injunctive relief), 
                  you and Company agree that that particular claim or request for relief (and only that particular claim or request 
                  for relief) shall be severed from the arbitration and may be litigated in the state or federal courts located in 
                  the State of New Jersey. All other Disputes shall be arbitrated or litigated in small claims court. This 
                  subsection does not prevent you or Company from participating in a class-wide settlement of claims.
                </p>
              </div>

              {/* 8.2(g) Attorneys' Fees and Costs */}
              <div className="mb-6 pl-4 border-l-2 border-red-700">
                <h4 className="text-lg font-semibold mb-3 text-slate-200">
                  (g) Attorneys&apos; Fees and Costs
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  The parties shall bear their own attorneys&apos; fees and costs in arbitration unless the arbitrator finds that 
                  either the substance of the Dispute or the relief sought in the Request was frivolous or was brought for an 
                  improper purpose (as measured by the standards set forth in Federal Rule of Civil Procedure 11(b)). If you or 
                  Company need to invoke the authority of a court of competent jurisdiction to compel arbitration, then the party 
                  that obtains an order compelling arbitration in such action shall have the right to collect from the other party 
                  its reasonable costs, necessary disbursements, and reasonable attorneys&apos; fees incurred in securing an order 
                  compelling arbitration. The prevailing party in any court action relating to whether either party has satisfied 
                  any condition precedent to arbitration, including the Informal Dispute Resolution Process, is entitled to recover 
                  their reasonable costs, necessary disbursements, and reasonable attorneys&apos; fees and costs.
                </p>
              </div>

              {/* 8.2(h) Batch Arbitration */}
              <div className="mb-6 pl-4 border-l-2 border-red-700">
                <h4 className="text-lg font-semibold mb-3 text-slate-200">
                  (h) Batch Arbitration
                </h4>
                <p className="text-slate-300 leading-relaxed mb-3">
                  To increase the efficiency of administration and resolution of arbitrations, you and Company agree that in the 
                  event that there are 100 or more individual Requests of a substantially similar nature filed against Company by 
                  or with the assistance of the same law firm, group of law firms, or organizations, within a 30 day period (or as 
                  soon as possible thereafter), the JAMS shall (1) administer the arbitration demands in batches of 100 Requests 
                  per batch (plus, to the extent there are less than 100 Requests left over after the batching described above, a 
                  final batch consisting of the remaining Requests); (2) appoint one arbitrator for each batch; and (3) provide 
                  for the resolution of each batch as a single consolidated arbitration with one set of filing and administrative 
                  fees due per side per batch, one procedural calendar, one hearing (if any) in a place to be determined by the 
                  arbitrator, and one final award (&quot;Batch Arbitration&quot;).
                </p>
                <p className="text-slate-300 leading-relaxed mb-3">
                  All parties agree that Requests are of a &quot;substantially similar nature&quot; if they arise out of or relate to 
                  the same event or factual scenario and raise the same or similar legal issues and seek the same or similar relief. 
                  To the extent the parties disagree on the application of the Batch Arbitration process, the disagreeing party 
                  shall advise the JAMS, and the JAMS shall appoint a sole standing arbitrator to determine the applicability of 
                  the Batch Arbitration process (&quot;Administrative Arbitrator&quot;). In an effort to expedite resolution of any such 
                  dispute by the Administrative Arbitrator, the parties agree the Administrative Arbitrator may set forth such 
                  procedures as are necessary to resolve any disputes promptly. The Administrative Arbitrator&apos;s fees shall be 
                  paid by Company.
                </p>
                <p className="text-slate-300 leading-relaxed mb-3">
                  You and Company agree to cooperate in good faith with the JAMS to implement the Batch Arbitration process 
                  including the payment of single filing and administrative fees for batches of Requests, as well as any steps to 
                  minimize the time and costs of arbitration, which may include: (1) the appointment of a discovery special master 
                  to assist the arbitrator in the resolution of discovery disputes; and (2) the adoption of an expedited calendar 
                  of the arbitration proceedings.
                </p>
                <p className="text-slate-300 leading-relaxed">
                  This Batch Arbitration provision shall in no way be interpreted as authorizing a class, collective and/or mass 
                  arbitration or action of any kind, or arbitration involving joint or consolidated claims under any circumstances, 
                  except as expressly set forth in this provision.
                </p>
              </div>

              {/* 8.2(i) 30-Day Right to Opt Out */}
              <div className="mb-6 pl-4 border-l-2 border-red-700">
                <h4 className="text-lg font-semibold mb-3 text-slate-200">
                  (i) 30-Day Right to Opt Out
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  You have the right to opt out of the provisions of this Arbitration Agreement by sending a timely written notice 
                  of your decision to opt out to the following address: 394 Baldwin Ave, Apt 1, Jersey City, New Jersey 07306, or 
                  email to info@sensybull.com, within 30 days after first becoming subject to this Arbitration Agreement. Your 
                  notice must include your name and address and a clear statement that you want to opt out of this Arbitration 
                  Agreement. If you opt out of this Arbitration Agreement, all other parts of these Terms will continue to apply 
                  to you. Opting out of this Arbitration Agreement has no effect on any other arbitration agreements that you may 
                  currently have with us, or may enter into in the future with us.
                </p>
              </div>

              {/* 8.2(j) Invalidity, Expiration */}
              <div className="mb-6 pl-4 border-l-2 border-red-700">
                <h4 className="text-lg font-semibold mb-3 text-slate-200">
                  (j) Invalidity, Expiration
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  Except as provided in the subsection entitled &quot;Waiver of Class or Other Non-Individualized Relief,&quot; if any 
                  part or parts of this Arbitration Agreement are found under the law to be invalid or unenforceable, then such 
                  specific part or parts shall be of no force and effect and shall be severed and the remainder of the Arbitration 
                  Agreement shall continue in full force and effect. You further agree that any Dispute that you have with Company 
                  as detailed in this Arbitration Agreement must be initiated via arbitration within the applicable statute of 
                  limitation for that claim or controversy, or it will be forever time barred. Likewise, you agree that all 
                  applicable statutes of limitation will apply to such arbitration in the same manner as those statutes of 
                  limitation would apply in the applicable court of competent jurisdiction.
                </p>
              </div>

              {/* 8.2(k) Modification */}
              <div className="pl-4 border-l-2 border-red-700">
                <h4 className="text-lg font-semibold mb-3 text-slate-200">
                  (k) Modification
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  Notwithstanding any provision in these Terms to the contrary, we agree that if Company makes any future material 
                  change to this Arbitration Agreement, you may reject that change within 30 days of such change becoming effective 
                  by writing Company at the following address: 394 Baldwin Ave, Apt 1, Jersey City, New Jersey 07306, or email to 
                  info@sensybull.com. Unless you reject the change within 30 days of such change becoming effective by writing to 
                  Company in accordance with the foregoing, your continued use of the Site and/or Services, including the acceptance 
                  of products and services offered on the Site following the posting of changes to this Arbitration Agreement 
                  constitutes your acceptance of any such changes. Changes to this Arbitration Agreement do not provide you with a 
                  new opportunity to opt out of the Arbitration Agreement if you have previously agreed to a version of these Terms 
                  and did not validly opt out of arbitration. If you reject any change or update to this Arbitration Agreement, and 
                  you were bound by an existing agreement to arbitrate Disputes arising out of or relating in any way to your access 
                  to or use of the Services or of the Site, any communications you receive, any products sold or distributed through 
                  the Site, the Services, or these Terms, the provisions of this Arbitration Agreement as of the date you first 
                  accepted these Terms (or accepted any subsequent changes to these Terms) remain in full force and effect. Company 
                  will continue to honor any valid opt outs of the Arbitration Agreement that you made to a prior version of these 
                  Terms.
                </p>
              </div>
            </div>

            {/* 8.3 Export */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3 text-slate-200">8.3 Export</h3>
              <p className="text-slate-300 leading-relaxed">
                The Site may be subject to U.S. export control laws and may be subject to export or import regulations in other 
                countries. You agree not to export, reexport, or transfer, directly or indirectly, any U.S. technical data acquired 
                from Company, or any products utilizing such data, in violation of the United States export laws or regulations.
              </p>
            </div>

            {/* 8.4 Disclosures */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3 text-slate-200">8.4 Disclosures</h3>
              <p className="text-slate-300 leading-relaxed">
                Company is located at the address in Section 8.8. If you are a California resident, you may report complaints to 
                the Complaint Assistance Unit of the Division of Consumer Product of the California Department of Consumer Affairs 
                by contacting them in writing at 400 R Street, Sacramento, CA 95814, or by telephone at (800) 952-5210.
              </p>
            </div>

            {/* 8.5 Electronic Communications */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3 text-slate-200">8.5 Electronic Communications</h3>
              <p className="text-slate-300 leading-relaxed">
                The communications between you and Company use electronic means, whether you use the Site or send us emails, or 
                whether Company posts notices on the Site or communicates with you via email. For contractual purposes, you (a) 
                consent to receive communications from Company in an electronic form; and (b) agree that all terms and conditions, 
                agreements, notices, disclosures, and other communications that Company provides to you electronically satisfy any 
                legal requirement that such communications would satisfy if it were be in a hardcopy writing. The foregoing does 
                not affect your non-waivable rights.
              </p>
            </div>

            {/* 8.6 Entire Terms */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3 text-slate-200">8.6 Entire Terms</h3>
              <p className="text-slate-300 leading-relaxed">
                These Terms constitute the entire agreement between you and us regarding the use of the Site. Our failure to 
                exercise or enforce any right or provision of these Terms shall not operate as a waiver of such right or provision. 
                The section titles in these Terms are for convenience only and have no legal or contractual effect. The word 
                &quot;including&quot; means &quot;including without limitation&quot;. If any provision of these Terms is, for any reason, held 
                to be invalid or unenforceable, the other provisions of these Terms will be unimpaired and the invalid or 
                unenforceable provision will be deemed modified so that it is valid and enforceable to the maximum extent permitted 
                by law. Your relationship to Company is that of an independent contractor, and neither party is an agent or partner 
                of the other. These Terms, and your rights and obligations herein, may not be assigned, subcontracted, delegated, 
                or otherwise transferred by you without Company&apos;s prior written consent, and any attempted assignment, 
                subcontract, delegation, or transfer in violation of the foregoing will be null and void. Company may freely assign 
                these Terms. The terms and conditions set forth in these Terms shall be binding upon assignees.
              </p>
            </div>

            {/* 8.7 Copyright/Trademark Information */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3 text-slate-200">8.7 Copyright/Trademark Information</h3>
              <p className="text-slate-300 leading-relaxed">
                Copyright © 2025 Sensybull, LLC. All rights reserved. All trademarks, logos and service marks (&quot;Marks&quot;) 
                displayed on the Site are our property or the property of other third parties. You are not permitted to use these 
                Marks without our prior written consent or the consent of such third party which may own the Marks.
              </p>
            </div>

            {/* 8.8 Contact Information */}
            <div className="mb-6 p-6 bg-slate-900/50 border border-slate-800 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-slate-200">8.8 Contact Information</h3>
              <div className="text-slate-300 space-y-2">
                <p><strong>Soham Siddhesh Jain</strong></p>
                <p>394 Baldwin Ave, Apt 1</p>
                <p>Jersey City, New Jersey 07306</p>
                <p>Telephone: (551) 399-4727</p>
                <p>Email: <a href="mailto:info@sensybull.com" className="text-blue-400 hover:text-blue-300">info@sensybull.com</a></p>
              </div>
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