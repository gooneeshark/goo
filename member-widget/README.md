# Member Widget

A standalone, embeddable authentication widget that can be integrated into any HTML website. The widget connects to your existing Supabase-powered authentication system and provides a seamless login experience with a hacker terminal theme.

## Features

- 🔐 **Secure Authentication** - Integrates with Supabase Auth
- 🎨 **Customizable Themes** - Hacker, Dark, Light, and Custom themes
- 📱 **Mobile Responsive** - Works on all devices and screen sizes
- ⚡ **Easy Integration** - Single JavaScript file, no dependencies
- 🚀 **Lightweight** - Minimal footprint, fast loading
- 🎯 **Flexible Positioning** - Fixed corners or inline placement

## Quick Start

### 1. Basic Integration

Add these lines to your HTML page:

```html
<!-- Widget container -->
<div id="member-widget"></div>

<!-- Widget script -->
<script src="https://cdn.yoursite.com/member-widget.js"></script>

<!-- Initialize -->
<script>
new MemberWidget({
    containerId: 'member-widget',
    apiUrl: 'https://your-app.com',
    theme: 'hacker',
    position: 'bottom-right'
});
</script>
```

### 2. Auto-initialization with Data Attributes

```html
<div id="member-widget" 
     data-member-widget
     data-api-url="https://your-app.com"
     data-theme="hacker"
     data-position="bottom-right">
</div>

<script src="member-widget.js"></script>
<!-- Widget will auto-initialize -->
```

## Configuration Options

```javascript
new MemberWidget({
    // Required
    containerId: 'member-widget',        // ID of container element
    apiUrl: 'https://your-app.com',      // Your Supabase app URL
    
    // Appearance
    theme: 'hacker',                     // 'hacker', 'dark', 'light', 'custom'
    position: 'bottom-right',            // 'bottom-right', 'bottom-left', 'top-right', 'top-left', 'inline'
    size: 'medium',                      // 'small', 'medium', 'large'
    collapsed: true,                     // Start collapsed
    
    // Custom colors (for 'custom' theme)
    colors: {
        primary: '#00ff00',
        secondary: '#008800',
        background: '#000000',
        text: '#ffffff',
        border: '#00ff00'
    },
    
    // Features
    features: {
        walletDisplay: true,
        pointsDisplay: true,
        profileEdit: true
    },
    
    // Event callbacks
    onLogin: (user) => {
        console.log('User logged in:', user);
    },
    onLogout: () => {
        console.log('User logged out');
    },
    onError: (error) => {
        console.error('Widget error:', error);
    }
});
```

## Themes

### Hacker Theme (Default)
- Green terminal-style interface
- Monospace fonts
- Glitch effects and animations
- Scan line effects

### Dark Theme
- Modern dark interface
- Clean typography
- Subtle animations

### Light Theme
- Clean white interface
- Professional appearance
- Suitable for business sites

### Custom Theme
- Define your own colors
- Maintain terminal styling
- Brand-specific appearance

## API Methods

```javascript
const widget = new MemberWidget(options);

// Control widget
widget.expand();           // Expand widget
widget.collapse();         // Collapse widget
widget.toggle();           // Toggle state
widget.refresh();          // Refresh data
widget.destroy();          // Remove widget

// Get data
const user = widget.getCurrentUser();
const session = widget.getSession();
```

## Events

Listen for widget events:

```javascript
document.addEventListener('memberWidget:login', (event) => {
    const user = event.detail.user;
    console.log('User logged in:', user);
});

document.addEventListener('memberWidget:logout', (event) => {
    console.log('User logged out');
});

document.addEventListener('memberWidget:error', (event) => {
    const error = event.detail.error;
    console.error('Widget error:', error);
});
```

## Supabase Configuration

The widget needs access to your Supabase configuration. You can provide this in several ways:

### Method 1: Global Variables
```javascript
window.SUPABASE_URL = 'https://your-project.supabase.co';
window.SUPABASE_ANON_KEY = 'your-anon-key';
```

### Method 2: Meta Tags
```html
<meta name="supabase-url" content="https://your-project.supabase.co">
<meta name="supabase-key" content="your-anon-key">
```

### Method 3: Environment Variables (if using build process)
```javascript
window.VITE_DOG = 'https://your-project.supabase.co';
window.VITE_CAT = 'your-anon-key';
```

## Styling and Customization

### CSS Custom Properties

Override widget styles using CSS custom properties:

```css
.member-widget {
    --widget-primary-color: #ff0000;
    --widget-background-color: #1a1a1a;
    --widget-text-color: #ffffff;
    --widget-border-radius: 10px;
    --widget-shadow: 0 4px 20px rgba(255, 0, 0, 0.3);
}
```

### Custom CSS Classes

Add custom styles:

```css
.member-widget.my-custom-theme {
    border: 3px solid #purple;
    background: linear-gradient(45deg, #purple, #blue);
}

.member-widget.my-custom-theme .widget-header {
    background: rgba(128, 0, 128, 0.8);
}
```

## Mobile Optimization

The widget automatically adapts to mobile devices:

- Responsive layout adjustments
- Touch-friendly controls
- Optimized font sizes
- Mobile-specific positioning options

### Mobile-specific Configuration

```javascript
new MemberWidget({
    containerId: 'member-widget',
    apiUrl: 'https://your-app.com',
    
    // Mobile settings
    mobile: {
        fullscreen: true,           // Full screen on mobile
        swipeToClose: true,         // Swipe to close
        position: 'bottom-center'   // Mobile position
    }
});
```

## Security Considerations

### Domain Restrictions
Configure allowed domains in your widget settings:

```javascript
domains: ['example.com', '*.example.com', 'localhost']
```

### Content Security Policy
Add appropriate CSP headers:

```html
<meta http-equiv="Content-Security-Policy" 
      content="script-src 'self' https://cdn.yoursite.com; 
               connect-src 'self' https://your-project.supabase.co;">
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Development

### Project Structure
```
member-widget/
├── src/
│   ├── core/
│   │   └── MemberWidget.js      # Main widget class
│   └── components/
│       ├── LoginPanel.js        # Login form component
│       └── ProfileDisplay.js    # Profile display component
├── example/
│   └── index.html              # Demo page
├── docs/                       # Documentation
└── README.md
```

### Building

The widget is designed to work as a standalone JavaScript file. For production:

1. Concatenate all JavaScript files
2. Minify the result
3. Host on your CDN

### Testing

Open `example/index.html` in your browser to test the widget:

1. Configure Supabase credentials in the HTML file
2. Open the file in a web browser
3. Test different themes and positions
4. Try logging in with your Supabase users

## Troubleshooting

### Widget Not Appearing
- Check that the container element exists
- Verify JavaScript console for errors
- Ensure Supabase configuration is correct

### Authentication Not Working
- Verify Supabase URL and key
- Check CORS settings in Supabase
- Ensure your domain is allowed

### Styling Issues
- Check for CSS conflicts
- Verify z-index values
- Use browser dev tools to inspect styles

### Debug Mode

Enable debug mode for troubleshooting:

```javascript
new MemberWidget({
    containerId: 'member-widget',
    apiUrl: 'https://your-app.com',
    debug: true,  // Enable debug logging
    
    onDebug: (message) => {
        console.log('[Widget Debug]:', message);
    }
});
```

## Examples

### E-commerce Integration
```javascript
new MemberWidget({
    containerId: 'member-widget',
    apiUrl: 'https://your-shop.com',
    theme: 'dark',
    position: 'top-right',
    onLogin: (user) => {
        // Show member discounts
        showMemberPricing(user);
        updateCartWithMemberPrices();
    }
});
```

### Blog Integration
```javascript
new MemberWidget({
    containerId: 'member-widget',
    apiUrl: 'https://your-blog.com',
    theme: 'light',
    position: 'inline',
    features: {
        walletDisplay: false,
        pointsDisplay: true
    },
    onLogin: (user) => {
        // Unlock premium content
        showPremiumArticles(user);
    }
});
```

## License

MIT License - see LICENSE file for details.

## Support

- 📖 [Documentation](docs/)
- 🐛 [Issues](https://github.com/your-repo/member-widget/issues)
- 💬 [Discussions](https://github.com/your-repo/member-widget/discussions)
- 📧 [Email Support](mailto:support@yoursite.com)