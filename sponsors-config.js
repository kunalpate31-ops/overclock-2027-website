/**
 * OVERCLOCK 2027 — SPONSORS CONFIGURATION
 * FCRIT × IEEE Student Branch
 * All sponsor data and placeholder generation are configured here.
 */

const SPONSORS_CONFIG = {
  // Total placeholder sponsors to generate if custom list is empty
  // Edit this number to change the total count of placeholders automatically.
  TOTAL_PLACEHOLDER_SPONSORS: 6,

  // Contact details for partnership inquiries
  sponsorContactEmail: "mailto:sponsorship.overclock@fcrit.ac.in",
  
  // URL for sponsorship brochure (set to null or empty string to hide the brochure button)
  brochureUrl: null, // e.g. "assets/OVERCLOCK_2027_Sponsorship_Brochure.pdf"

  // Custom sponsors list (leave empty [] to auto-generate placeholder cards)
  // Format: { name: "Company", tier: "TITLE", logo: "path/to/logo.png", url: "https://example.com" }
  customSponsors: [],

  // Tier configuration with slot allocations & styling
  tiers: [
    {
      id: "TITLE",
      title: "TITLE PARTNER",
      stampText: "TITLE PARTNER",
      cardClass: "tier-title-card",
      badgeClass: "badge-title",
      slots: 1
    },
    {
      id: "GOLD",
      title: "GOLD PARTNERS",
      stampText: "GOLD CLEARANCE",
      cardClass: "tier-gold-card",
      badgeClass: "badge-gold",
      slots: 2
    },
    {
      id: "SILVER",
      title: "SILVER PARTNERS",
      stampText: "SILVER CLEARANCE",
      cardClass: "tier-silver-card",
      badgeClass: "badge-silver",
      slots: Infinity // Takes remaining
    }
  ]
};

// Helper function to resolve sponsors list
function getSponsorsData() {
  if (SPONSORS_CONFIG.customSponsors && SPONSORS_CONFIG.customSponsors.length > 0) {
    return SPONSORS_CONFIG.customSponsors;
  }

  // Auto-generate placeholder sponsors
  const sponsors = [];
  const total = SPONSORS_CONFIG.TOTAL_PLACEHOLDER_SPONSORS;
  
  for (let i = 1; i <= total; i++) {
    const numStr = String(i).padStart(2, '0');
    let tier = "SILVER";
    if (i === 1) tier = "TITLE";
    else if (i === 2 || i === 3) tier = "GOLD";

    sponsors.push({
      id: `OC-27-${numStr}`,
      name: `SPONSOR ${numStr}`,
      tier: tier,
      logo: null, // Renders neutral SVG logo box
      url: "#"
    });
  }

  return sponsors;
}

// Export for module or global use
if (typeof window !== 'undefined') {
  window.SPONSORS_CONFIG = SPONSORS_CONFIG;
  window.getSponsorsData = getSponsorsData;
}
