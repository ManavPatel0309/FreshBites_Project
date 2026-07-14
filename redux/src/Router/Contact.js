import React from 'react'
import { FaPaperPlane, FaFacebookF, FaInstagram, FaYoutube, FaLinkedin } from 'react-icons/fa';

const Contact = () => {
  return (
    <>
    
    <div className="foods-container"> 
<div className="foods-header">Contact</div>
    </div>
    <footer className="footer">
            <div className="footer-grid">
              <div className="footer-section">
                <img src="https://react-food-project-five.vercel.app/static/media/res-logo.150c9007ec5a83adf3c4.png" alt="Fresh Bites" className="footer-logo" />
                <h3>Fresh Bites</h3>
                <p>
                  Welcome to Fresh Bites, your ultimate destination for delicious and fresh online food ordering!
                </p>
              </div>
    
              <div className="footer-section">
                <h4>Delivery Time</h4>
                <p><strong>Monday – Friday</strong><br />10:00am – 11:00pm</p>
                <p><strong>Saturday – Sunday</strong><br />Full Day</p>
              </div>
    
              <div className="footer-section">
                <h4>Contact</h4>
                <p>Location: Sola, Ahmedabad</p>
                <p>Phone: 8511755852</p>
                <p>Email: divy2332gj2@gmail.com</p>
              </div>
    
              <div className="footer-section">
                <h4>Newsletter</h4>
                <p>Subscribe our newsletter</p>
                <div className="newsletter">
                  <input type="email" placeholder="Enter your email" />
                  <button className="send-btn"><FaPaperPlane /></button>
                </div>
    
                <div className="social-icons">
                  <FaFacebookF />
                  <FaInstagram />
                  <FaYoutube />
                  <FaLinkedin />
                </div>
              </div>
            </div>
    
            <p className="footer-bottom">
              Copyright © 2024, website made by Divy Doshi. All Rights Reserved.
            </p>
          </footer>
         
          </>
  )
}

export default Contact

