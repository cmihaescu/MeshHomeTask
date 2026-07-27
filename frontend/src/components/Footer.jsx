import React from 'react';
import { MeshWordmark } from './brand/MeshLogo';

const Footer = () => (
  <footer className="site-footer">
    <div className="site-footer__inner">
      <div className="site-footer__brand">
        <a
          href="https://meshconnect.com"
          target="_blank"
          rel="noreferrer"
          aria-label="Mesh Connect website"
        >
          <MeshWordmark height={22} />
        </a>
        <p className="site-footer__powered">
          Payments powered by <a href="https://meshconnect.com" target="_blank" rel="noreferrer">Mesh Connect</a>
        </p>
      </div>
      <p className="site-footer__meta">
        Demo storefront · no real goods sold
        <br />
        settlement in crypto · sandbox friendly
      </p>
    </div>
  </footer>
);

export default Footer;
