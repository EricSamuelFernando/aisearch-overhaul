"use client";

import React, { useState, useEffect } from "react";

export default function WaitlistTemplatePage() {
  const [showToaster, setShowToaster] = useState(false);
  const [toasterMessage, setToasterMessage] = useState("");

  // Show toaster helper
  const showToast = (message: string) => {
    setToasterMessage(message);
    setShowToaster(true);
    setTimeout(() => setShowToaster(false), 5000);
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#ffffff" }}>
      <div style={{ maxWidth: "734px", margin: "0 auto", padding: "20px" }}>
        {/* Header Image */}
        <img
          src="https://obidea777.github.io/Snaphoz_images/email01.png"
          alt="Snaphomz"
          style={{ width: "100%", height: "auto", borderRadius: 8 }}
        />

        {/* Header Text */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <p style={{ fontSize: 16, fontWeight: 100, lineHeight: 1.45, padding: "2px 63px" }}>
            Buyers. Sellers. Agents. Unified in{" "}
            <span style={{ color: "#FF5A00" }}>one place</span>, driven by complete transparency
          </p>

          <a
            href="https://preprod.snaphomz.com/company"
            onClick={(e) => {
              e.preventDefault();
              showToast("Discover Today clicked!");
            }}
            style={{
              display: "block",
              backgroundColor: "#FF4500",
              color: "#fff",
              padding: "15px 22px",
              fontSize: 16,
              textDecoration: "none",
              borderRadius: 24,
              margin: "24px auto",
              width: "fit-content",
              textAlign: "center",
              fontStyle: "italic",
            }}
          >
            Discover Today
          </a>

          <p style={{ fontSize: 16, lineHeight: 1.6, fontWeight: 100, color: "#727272" }}>
            <span style={{ color: "#FF5A00" }}>Our founders</span> lived the frustration of
            fragmented real estate firsthand. So they built Snaphomz, an all-in-one platform that
            simplifies the process with <strong>clarity, control, and guided tools.</strong>
          </p>
        </div>

        {/* Info Sections */}
        {[
          {
            title: "Simpler Buying",
            desc: "Easily find homes tailored exactly to your preferences with our AI driven search. Get instantly pre-approved for a mortgage, simplify your paperwork, and confidently make secure offers, all from one seamless platform.",
            img: "https://obidea777.github.io/Snaphoz_images/image%2013.png",
            reverse: false,
          },
          {
            title: "Simpler Selling",
            desc: "Snaphomz brings sellers and agents into one transparent workspace. List quickly, market intelligently, and evaluate offers with AI, all while boosting your home’s value through staging and concierge tools.",
            img: "https://obidea777.github.io/Snaphoz_images/image%2010.png",
            reverse: true,
          },
          {
            title: "Empowering Agents",
            desc: "Manage clients smoothly, communicate securely, and close deals faster. Snaphomz provides built in CRM tools, automated listings, advanced analytics, and seamless transaction management saving you valuable time.",
            img: "https://obidea777.github.io/Snaphoz_images/image%206.png",
            reverse: false,
          },
          {
            title: "Radical Transparency. First in the Industry",
            desc: "Nothing’s hidden anymore offers, messages, analytics, and buyer agent to seller agent conversations are fully transparent",
            img: "https://obidea777.github.io/Snaphoz_images/image%2014.png",
            reverse: false,
          },
          {
            title: "Transaction times Cut by 50%",
            desc: "From offer to close, speed things up with AI driven tools, expert guidance, and one platform where everyone stays connected",
            img: "https://obidea777.github.io/Snaphoz_images/image%204%20(1).png",
            reverse: true,
          },
          {
            title: "0% fees. Zero surprises.",
            desc: "Enjoy Snaphomz completely free, without any hidden costs. Because clarity should never cost extra.",
            img: "https://raw.githubusercontent.com/YashOBI/snaphomz_images/c599fc1ccc8b6f333cd358bad5b5f41181b06f92/cta-1.png",
            reverse: false,
          },
        ].map((section, idx) => (
          <div key={idx} style={{ display: "flex", flexDirection: section.reverse ? "row-reverse" : "row", margin: "40px 0", alignItems: "center" }}>
            <div style={{ flex: 1, padding: "0 20px" }}>
              <h3 style={{ fontSize: 32, fontWeight: 400, textAlign: section.reverse ? "right" : "left" }}>
                <span style={{ color: "#FF5A00" }}>{section.title.split(" ")[0]}</span>{" "}
                {section.title.split(" ").slice(1).join(" ")}
              </h3>
              <p style={{ fontSize: 16, lineHeight: 1.6, fontWeight: 100, color: "#727272", textAlign: section.reverse ? "right" : "left" }}>
                {section.desc}
              </p>
            </div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <img src={section.img} alt={section.title} style={{ maxWidth: 200, height: "auto" }} />
            </div>
          </div>
        ))}

        {/* Call to Action Video */}
        <div style={{ textAlign: "center", margin: "40px 0" }}>
          <h3>
            <img src="https://obidea777.github.io/Snaphoz_images/Vector.png" width={70} alt="Snaphomz" />
            Explore the journey through this video
          </h3>
          <a href="https://www.youtube.com/embed/wxnCua71Bpc" target="_blank" rel="noreferrer">
            <img
              src="https://obidea777.github.io/Snaphoz_images/explore-image-waitlist.jpg"
              alt="Explore Snaphomz Waitlist"
              style={{ width: "100%", height: "auto", border: "none" }}
            />
          </a>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", marginTop: 40, padding: "20px 0" }}>
          <div style={{ flex: 1 }}>
            <img
              src="https://obidea777.github.io/Snaphoz_images/Clip%20path%20group%20(1).png"
              alt="Nrupen Mandava"
              style={{ maxWidth: 150, borderRadius: 10 }}
            />
            <p style={{ fontSize: 18, fontWeight: 400, marginTop: 20 }}>Cheers,</p>
            <img
              src="https://raw.githubusercontent.com/YashOBI/snaphomz_images/5a8cf9afee5dd56d86e82f9042d9c1c6079bcfff/owner.png"
              alt="Snaphomz"
              style={{ maxWidth: 200 }}
            />
            <p style={{ fontSize: 16, fontWeight: 400 }}>Co-Founder, Snaphomz</p>
            <p style={{ fontSize: 16, fontWeight: 400 }}>
              <a href="mailto:nrupen@snaphomz.com" style={{ color: "#1E88E5", textDecoration: "none" }}>
                nrupen@snaphomz.com
              </a>
            </p>
          </div>
          <div style={{ flex: 1, textAlign: "left", paddingLeft: 30 }}>
            <h3 style={{ fontSize: 28, fontWeight: "bold" }}>
              <span style={{ color: "#FF5A00" }}>Built around</span>
              <br />
              your journey
            </h3>
            <p style={{ fontSize: 16, fontWeight: 400 }}>
              We deliver digital-first real estate for how buyers, sellers, and agents actually work.
            </p>
          </div>
        </div>

        {/* Bottom Footer */}
        <div style={{ backgroundColor: "#FE4E00", color: "#fff", textAlign: "center", padding: 20, borderRadius: 8 }}>
          <p style={{ fontSize: 16 }}>
            <a
              href="mailto:support@snaphomz.com?subject=Support%20Request"
              onClick={(e) => {
                e.preventDefault();
                showToast("Support email: support@snaphomz.com");
              }}
              style={{ color: "#fff", textDecoration: "underline" }}
            >
              Questions? [ Contact Support ]
            </a>
            <br />
            We're always here for you. <br />
            <span>© Snaphomz</span> |{" "}
            <a
              href="https://snaphomz.com/waitlist-unsubscribe"
              target="_blank"
              rel="noreferrer"
              onClick={(e) => {
                e.preventDefault();
                showToast("You have successfully unsubscribed.");
              }}
              style={{ color: "#fff", textDecoration: "underline" }}
            >
              [Unsubscribe]
            </a>{" "}
            |{" "}
            <a
              href="https://snaphomz.com/waitlist-template"
              target="_blank"
              rel="noreferrer"
              style={{ color: "#fff", textDecoration: "none" }}
            >
              View in Browser
            </a>
          </p>
        </div>

        {/* Toaster */}
        {showToaster && (
          <div
            style={{
              position: "fixed",
              top: 20,
              right: 20,
              padding: "15px 20px",
              backgroundColor: "#4CAF50",
              color: "#fff",
              borderRadius: 10,
              fontSize: 16,
              zIndex: 1000,
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              display: "flex",
              alignItems: "center",
              opacity: 1,
              transition: "opacity 0.5s",
            }}
          >
            <span style={{ fontSize: 20, marginRight: 15 }}>&#10003;</span>
            <span>{toasterMessage}</span>
            <span
              style={{ fontSize: 18, cursor: "pointer", marginLeft: 15 }}
              onClick={() => setShowToaster(false)}
            >
              ×
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
