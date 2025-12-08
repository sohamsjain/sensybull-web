import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
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
            Privacy Policy
          </h1>
          <p className="text-slate-400">
            Last updated: December 8, 2025
          </p>
        </div>

        {/* Privacy Content */}
        <div className="prose prose-invert prose-slate max-w-none">
          {/* Introduction */}
          <div className="mb-8 p-6 bg-slate-900/50 border border-slate-800 rounded-lg">
            <p className="text-slate-300 leading-relaxed mb-4">
              Sensybull, LLC (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to maintaining robust 
              privacy protections for its users. Our Privacy Policy is designed to help you understand 
              how we collect, use and safeguard the information you provide to us and to assist you in 
              making informed decisions when using our Service.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              For purposes of this Agreement, &quot;Site&quot; refers to the Company&apos;s website, which can be 
              accessed at <strong>www.sensybull.com</strong> and through our mobile application.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              &quot;Service&quot; refers to the Company&apos;s services accessed via the Site, in which users can 
              access personalized financial news, market insights, stock information, and investment 
              research tools.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              The terms &quot;we,&quot; &quot;us,&quot; and &quot;our&quot; refer to the Company. &quot;You&quot; refers to you, as a user 
              of our Site or our Service.
            </p>
            <p className="text-slate-300 leading-relaxed">
              By accessing our Site or our Service, you accept our Privacy Policy and{' '}
              <Link href="/terms" className="text-blue-400 hover:text-blue-300">Terms of Use</Link>, 
              and you consent to our collection, storage, use and disclosure of your Personal Information 
              as described in this Privacy Policy.
            </p>
          </div>

          {/* Section I: Information We Collect */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-white">I. Information We Collect</h2>
            
            <p className="text-slate-300 leading-relaxed mb-4">
              We collect &quot;Non-Personal Information&quot; and &quot;Personal Information.&quot;
            </p>
            
            <p className="text-slate-300 leading-relaxed mb-4">
              <strong className="text-white">Non-Personal Information</strong> includes information that 
              cannot be used to personally identify you, such as anonymous usage data, general demographic 
              information we may collect, referring/exit pages and URLs, platform types, preferences you 
              submit and preferences that are generated based on the data you submit and number of clicks.
            </p>
            
            <p className="text-slate-300 leading-relaxed mb-6">
              <strong className="text-white">Personal Information</strong> includes your email address, 
              name, and account preferences, which you submit to us through the registration process at 
              the Site.
            </p>

            {/* Subsection 1: Technology */}
            <div className="mb-6 pl-6 border-l-2 border-slate-700">
              <h3 className="text-xl font-semibold mb-3 text-slate-200">
                1. Information Collected via Technology
              </h3>
              <p className="text-slate-300 leading-relaxed mb-3">
                To activate the Service you need to submit your email address. To use the Service thereafter, 
                you may need to submit further Personal Information including your name and investment preferences. 
                However, in an effort to improve the quality of the Service, we track information provided to us 
                by your browser or by our software application when you view or use the Service, such as the 
                website you came from (known as the &quot;referring URL&quot;), the type of browser you use, the device 
                from which you connected to the Service, the time and date of access, and other information that 
                does not personally identify you.
              </p>
              <p className="text-slate-300 leading-relaxed mb-3">
                We track this information using cookies, or small text files which include an anonymous unique 
                identifier. Cookies are sent to a user&apos;s browser from our servers and are stored on the user&apos;s 
                computer hard drive. Sending a cookie to a user&apos;s browser enables us to collect Non-Personal 
                information about that user and keep a record of the user&apos;s preferences when utilizing our 
                services, both on an individual and aggregate basis.
              </p>
              <p className="text-slate-300 leading-relaxed mb-3">
                For example, the Company may use cookies to collect the following information:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4 mb-3">
                <li>User preferences and settings</li>
                <li>Stocks and sectors you track</li>
                <li>Articles you view and interact with</li>
                <li>App usage patterns and session duration</li>
                <li>Device and browser information</li>
              </ul>
              <p className="text-slate-300 leading-relaxed">
                The Company may use both persistent and session cookies; persistent cookies remain on your 
                computer after you close your session and until you delete them, while session cookies expire 
                when you close your browser.
              </p>
            </div>

            {/* Subsection 2: Registration */}
            <div className="mb-6 pl-6 border-l-2 border-slate-700">
              <h3 className="text-xl font-semibold mb-3 text-slate-200">
                2. Information You Provide by Registering for an Account
              </h3>
              <p className="text-slate-300 leading-relaxed">
                In addition to the information provided automatically by your browser when you visit the Site, 
                to become a subscriber to the Service you will need to create a personal profile. You can create 
                a profile by registering with the Service and entering your email address, creating a user name 
                and a password, and optionally providing your name. By registering, you are authorizing us to 
                collect, store and use your email address in accordance with this Privacy Policy.
              </p>
            </div>

            {/* Subsection 3: Children's Privacy */}
            <div className="pl-6 border-l-2 border-slate-700">
              <h3 className="text-xl font-semibold mb-3 text-slate-200">
                3. Children&apos;s Privacy
              </h3>
              <p className="text-slate-300 leading-relaxed">
                The Site and the Service are not directed to anyone under the age of 18. The Site does not 
                knowingly collect or solicit information from anyone under the age of 18, or allow anyone under 
                the age of 18 to sign up for the Service. In the event that we learn that we have gathered 
                personal information from anyone under the age of 18 without the consent of a parent or guardian, 
                we will delete that information as soon as possible. If you believe we have collected such 
                information, please contact us at{' '}
                <a href="mailto:info@sensybull.com" className="text-blue-400 hover:text-blue-300">
                  info@sensybull.com
                </a>.
              </p>
            </div>
          </section>

          {/* Section II: How We Use Information */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-white">II. How We Use and Share Information</h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3 text-slate-200">Personal Information</h3>
              <p className="text-slate-300 leading-relaxed mb-3">
                Except as otherwise stated in this Privacy Policy, we do not sell, trade, rent or otherwise 
                share for marketing purposes your Personal Information with third parties without your consent. 
                We do share Personal Information with vendors who are performing services for the Company, such 
                as the servers for our email communications who are provided access to user&apos;s email address for 
                purposes of sending emails from us. Those vendors use your Personal Information only at our 
                direction and in accordance with our Privacy Policy.
              </p>
              <p className="text-slate-300 leading-relaxed mb-3">
                In general, the Personal Information you provide to us is used to help us communicate with you. 
                For example, we use Personal Information to contact users in response to questions, solicit 
                feedback from users, provide technical support, and inform users about promotional offers.
              </p>
              <p className="text-slate-300 leading-relaxed">
                We may share Personal Information with outside parties if we have a good-faith belief that access, 
                use, preservation or disclosure of the information is reasonably necessary to meet any applicable 
                legal process or enforceable governmental request; to enforce applicable Terms of Service, including 
                investigation of potential violations; address fraud, security or technical concerns; or to protect 
                against harm to the rights, property, or safety of our users or the public as required or permitted 
                by law.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3 text-slate-200">Non-Personal Information</h3>
              <p className="text-slate-300 leading-relaxed mb-3">
                In general, we use Non-Personal Information to help us improve the Service and customize the user 
                experience. We also aggregate Non-Personal Information in order to track trends and analyze use 
                patterns on the Site. This Privacy Policy does not limit in any way our use or disclosure of 
                Non-Personal Information and we reserve the right to use and disclose such Non-Personal Information 
                to our partners, advertisers and other third parties at our discretion.
              </p>
              <p className="text-slate-300 leading-relaxed">
                In the event we undergo a business transaction such as a merger, acquisition by another company, 
                or sale of all or a portion of our assets, your Personal Information may be among the assets 
                transferred. You acknowledge and consent that such transfers may occur and are permitted by this 
                Privacy Policy, and that any acquirer of our assets may continue to process your Personal Information 
                as set forth in this Privacy Policy.
              </p>
            </div>
          </section>

          {/* Section III: Protection */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-white">III. How We Protect Information</h2>
            <p className="text-slate-300 leading-relaxed mb-3">
              We implement security measures designed to protect your information from unauthorized access. Your 
              account is protected by your account password and we urge you to take steps to keep your personal 
              information safe by not disclosing your password and by logging out of your account after each use.
            </p>
            <p className="text-slate-300 leading-relaxed">
              We further protect your information from potential security breaches by implementing certain 
              technological security measures including encryption, firewalls and secure socket layer technology. 
              However, these measures do not guarantee that your information will not be accessed, disclosed, 
              altered or destroyed by breach of such firewalls and secure server software. By using our Service, 
              you acknowledge that you understand and agree to assume these risks.
            </p>
          </section>

          {/* Section IV: Your Rights */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-white">
              IV. Your Rights Regarding the Use of Your Personal Information
            </h2>
            <p className="text-slate-300 leading-relaxed mb-3">
              You have the right at any time to prevent us from contacting you for marketing purposes. When we 
              send a promotional communication to a user, the user can opt out of further promotional communications 
              by following the unsubscribe instructions provided in each promotional e-mail.
            </p>
            <p className="text-slate-300 leading-relaxed">
              You can also indicate that you do not wish to receive marketing communications from us in the Settings 
              section of the Site or mobile app. Please note that notwithstanding the promotional preferences you 
              indicate by either unsubscribing or opting out in the Settings, we may continue to send you 
              administrative emails including, for example, periodic updates to our Privacy Policy.
            </p>
          </section>

          {/* Section V: Links */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-white">V. Links to Other Websites</h2>
            <p className="text-slate-300 leading-relaxed mb-3">
              As part of the Service, we may provide links to or compatibility with other websites or applications. 
              However, we are not responsible for the privacy practices employed by those websites or the information 
              or content they contain. This Privacy Policy applies solely to information collected by us through the 
              Site and the Service.
            </p>
            <p className="text-slate-300 leading-relaxed">
              Therefore, this Privacy Policy does not apply to your use of a third party website accessed by 
              selecting a link on our Site or via our Service. To the extent that you access or use the Service 
              through or on another website or application, then the privacy policy of that other website or 
              application will apply to your access or use of that site or application. We encourage our users 
              to read the privacy statements of other websites before proceeding to use them.
            </p>
          </section>

          {/* Section VI: Changes */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-white">VI. Changes to Our Privacy Policy</h2>
            <p className="text-slate-300 leading-relaxed mb-3">
              The Company reserves the right to change this policy and our Terms of Service at any time. We will 
              notify you of significant changes to our Privacy Policy by sending a notice to the primary email 
              address specified in your account or by placing a prominent notice on our site.
            </p>
            <p className="text-slate-300 leading-relaxed">
              Significant changes will go into effect 30 days following such notification. Non-material changes 
              or clarifications will take effect immediately. You should periodically check the Site and this 
              privacy page for updates.
            </p>
          </section>

          {/* Section VII: Contact */}
          <section className="mb-12 p-6 bg-slate-900/50 border border-slate-800 rounded-lg">
            <h2 className="text-2xl font-bold mb-6 text-white">VII. Contact Us</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              If you have any questions regarding this Privacy Policy or the practices of this Site, please 
              contact us by sending an email to{' '}
              <a href="mailto:info@sensybull.com" className="text-blue-400 hover:text-blue-300">
                info@sensybull.com
              </a>.
            </p>
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