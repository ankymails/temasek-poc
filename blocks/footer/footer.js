import { decorateIcons } from '../../scripts/aem.js';

/**
 * Static Temasek Review footer content, mirroring the live footer at
 * https://www.temasekreview.com.sg/. This is baked in directly (rather than
 * loaded from an authored /footer fragment) so the footer always renders the
 * same content, in every environment, without depending on anything being
 * authored first.
 */
const FOOTER_HTML = `
  <div class="footer-top">
    <div class="footer-brand">
      <p><a href="https://www.temasek.com.sg/"><img src="/icons/temasek-logo.svg" alt="Temasek" width="147" height="20" loading="lazy"></a></p>
    </div>
    <div class="footer-col">
      <h2 id="quick-links">Quick Links</h2>
      <ul>
        <li><a href="/from-our-chairman">From Our Chairman</a></li>
        <li><a href="/strategy">Strategy</a></li>
        <li><a href="/performance-and-portfolio">Performance &amp; Portfolio</a></li>
        <li><a href="/institution">Institution</a></li>
        <li><a href="/sustainability">Sustainability</a></li>
        <li><a href="/community-stewardship">Community Stewardship</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h2 id="useful-resources">Useful Resources</h2>
      <ul>
        <li><a href="/media-centre">Chart Centre</a></li>
        <li><a href="/media-centre">Downloads</a></li>
        <li><a href="/sitemap">Site Map</a></li>
      </ul>
    </div>
    <div class="footer-social">
      <h2 id="our-channels">Our Channels</h2>
      <ul>
        <li><a href="https://www.facebook.com/temasekholdings"><span class="icon icon-facebook"></span>Facebook</a></li>
        <li><a href="https://instagram.com/temasekseen/"><span class="icon icon-instagram"></span>Instagram</a></li>
        <li><a href="https://www.linkedin.com/company/temasek-holdings"><span class="icon icon-linkedin"></span>LinkedIn</a></li>
        <li><a href="https://t.me/temasekholdings"><span class="icon icon-telegram"></span>Telegram</a></li>
        <li><a href="https://www.tiktok.com/@temasek"><span class="icon icon-tiktok"></span>TikTok</a></li>
        <li><a href="https://www.messenger.com/t/temasekholdings"><span class="icon icon-messenger"></span>Messenger</a></li>
        <li><a href="https://tmsk.sg/whatsapp"><span class="icon icon-whatsapp"></span>WhatsApp</a></li>
        <li><a href="https://x.com/temasek"><span class="icon icon-twitter-x"></span>X</a></li>
        <li><a href="https://www.youtube.com/user/temasekdigital"><span class="icon icon-youtube"></span>YouTube</a></li>
      </ul>
    </div>
  </div>
  <div class="footer-legal">
    <ul>
      <li><a href="/legal-notice">Legal Notice</a></li>
      <li><a href="/privacy">Privacy</a></li>
      <li><a href="/accessibility">Accessibility</a></li>
      <li><a href="https://www.temasek.com.sg/en/contact-us">Contacts</a></li>
      <li><a href="/acknowledgements">Acknowledgements</a></li>
    </ul>
    <p>Copyright © 2026 Temasek Holdings (Private) Limited</p>
  </div>
`;

/**
 * decorates the footer with static content
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  block.textContent = '';
  const wrapper = document.createElement('div');
  wrapper.innerHTML = FOOTER_HTML;
  decorateIcons(wrapper);
  block.append(wrapper);
}
