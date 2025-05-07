# ÉnergIA Demo Presentation Guide

This document serves as the central reference for the ÉnergIA demo presentation at the Hydro-Québec hackathon. It provides a quick overview of all presentation resources and links to detailed documentation.

## Quick Reference

### Key Demo Resources
- **Demo Checklist**: [demo-checklist.md](./demo-checklist.md)
- **Test Plan**: [test-plan.md](./test-plan.md)
- **Video Script**: [video-script.md](./video-script.md)
- **Known Issues**: [known-issues.md](./known-issues.md)
- **Hosting Guide**: [hosting-guide.md](./hosting-guide.md)
- **Preparation Script**: [prepare-demo.sh](./prepare-demo.sh)

### Essential Commands
```bash
# Install dependencies
npm install --legacy-peer-deps

# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run preparation script
./prepare-demo.sh
```

### Important Keyboard Shortcuts
- **Ctrl+Shift+D**: Toggle demo mode
- **F11**: Browser full-screen mode
- **F5**: Refresh application
- **F12**: Open developer tools

## Presentation Overview

### Demo Flow (2 minutes)
1. **Home Screen** (0:00-0:15)
   - Show map with location indicators
   - Explain the purpose of ÉnergIA

2. **Image Capture** (0:15-0:40)
   - Demonstrate camera or file upload
   - Show processing animation

3. **Analysis Results** (0:40-1:10)
   - Show component annotations
   - Highlight detailed information panel

4. **Future Projection** (1:10-1:40)
   - Demonstrate toggle between current and future
   - Show risk assessment and recommendations

5. **Conclusion** (1:40-2:00)
   - Summarize benefits
   - Highlight key infrastructure protection benefits

### Available Demo Scenarios
- **General Infrastructure**: Standard electrical infrastructure with multiple components
- **Power Line Focus**: Demonstration focused on power lines with vegetation risks
- **Transformer Focus**: Demonstration focused on transformer equipment
- **Substation Focus**: Larger electrical substation with multiple components
- **Distribution Pole**: Standard distribution pole with high vegetation risk

## Pre-Presentation Preparation

1. **Testing**
   - Complete the test cases in [test-plan.md](./test-plan.md)
   - Verify all scenarios work correctly
   - Test offline operation by disconnecting from internet

2. **Setup**
   - Ensure all environment variables are set in `.env.local`
   - Run `./prepare-demo.sh` to automate preparation steps
   - Create backup video recording following [video-script.md](./video-script.md)

3. **Backup**
   - Copy the entire project folder to a USB drive
   - Save backup video in multiple formats (MP4, WebM)
   - Test application on the actual presentation device

## Presentation Day

Follow the detailed checklist in [demo-checklist.md](./demo-checklist.md) for:
- Morning setup steps
- Pre-presentation verification
- During-presentation flow
- Emergency recovery procedures

## Troubleshooting

If issues arise during the presentation:

1. **Network Issues**
   - Activate demo mode (Ctrl+Shift+D)
   - Continue with cached demo images

2. **Application Crashes**
   - Restart the browser
   - Navigate back to the application
   - Enable demo mode

3. **Hardware Issues**
   - Switch to the backup video recording
   - Use another device with the backup copy

For detailed troubleshooting, refer to [known-issues.md](./known-issues.md).

## Demo Benefits to Highlight

1. **Predictive Maintenance**
   - Identify vegetation risks before they cause outages
   - Optimize maintenance schedules based on AI predictions

2. **Cost Reduction**
   - Reduce the need for manual inspections
   - Prioritize high-risk areas for maintenance

3. **Reliability Improvement**
   - Decrease outages from vegetation interference
   - Better planning for long-term infrastructure management

4. **Ease of Use**
   - Intuitive interface accessible to all field workers
   - Works even in areas with limited connectivity

## Conclusion

This demo showcases how AI can transform infrastructure management for Hydro-Québec by:
- Identifying electrical components automatically
- Predicting vegetation growth and potential risks
- Providing actionable recommendations for maintenance
- Improving overall grid reliability and reducing outages

The application combines cutting-edge AI with practical field utility to create real value for Hydro-Québec's operations.