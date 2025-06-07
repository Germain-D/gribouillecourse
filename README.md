# GribouilleCourse / DrawYourPath

> 🎨 Transform your hand-drawn sketches into real running routes that follow actual roads and trails

**GribouilleCourse** (French) / **DrawYourPath** (English) is a free web application that allows you to draw freehand paths on a map and automatically converts them into real GPX routes following existing roads, trails, and paths. Perfect for runners, cyclists, and hikers who want to create unique routes from their imagination.

## ✨ Features

- **🎨 Freehand Drawing**: Draw your route idea directly on an interactive map with your mouse or finger
- **🗺️ Smart Route Generation**: Advanced routing algorithms that transform your sketch into real routes following existing roads, trails, and paths
- **🗺️ Multiple Activity Types**: Support for running/walking, cycling, and driving routes
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **🌍 Multilingual**: Full French and English support with language-specific URLs
- **📍 Geolocation**: Optional GPS positioning to center the map on your location
- **📁 GPX Export**: Download your generated routes as standard GPX files
- **⌚ Watch Compatibility**: Detailed instructions for Garmin, Coros, Apple Watch, Polar, Suunto, and smartphone apps
- **🆓 100% Free**: No subscriptions, no hidden fees - just use your own free OpenRouteService API key
- **🎯 Privacy-Focused**: Your API key and data stay with you

## 🚀 Live Demo

Visit the live application at: [Your Domain Here]

## 🛠️ Tech Stack

- **Frontend Framework**: [Nuxt.js 3](https://nuxt.com/) (Vue.js)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [DaisyUI](https://daisyui.com/) components
- **Maps**: [Leaflet](https://leafletjs.com/) with OpenStreetMap tiles
- **State Management**: [Pinia](https://pinia.vuejs.org/)
- **Internationalization**: Vue I18n with French and English translations
- **Icons**: [Phosphor Icons](https://phosphoricons.com/)
- **Routing API**: [OpenRouteService](https://openrouteservice.org/)
- **Deployment**: Static site generation ready

## 🔧 Installation & Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/draw_your_running_path.git
   cd draw_your_running_path
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔑 API Key Setup

This application requires a free OpenRouteService API key:

1. Visit [OpenRouteService Developer Portal](https://openrouteservice.org/dev/#/signup)
2. Create a free account
3. Generate an API key (free tier includes 2000 requests/day)
4. Enter your API key in the application interface

**Note**: Your API key is stored locally in your browser and never sent to our servers except for route generation requests to OpenRouteService.

## 🌐 Multilingual Support

The application supports both French and English with:

- **French**: Default language with URLs like `/`, `/draw`, `/results`
- **English**: URLs with `/en/` prefix like `/en/`, `/en/draw`, `/en/results`
- **Automatic detection**: Browser language detection with manual switcher
- **Complete translations**: All UI elements, messages, and instructions

### Adding New Languages

1. Create a new locale file in `i18n/locales/[lang].json`
2. Add the language to `nuxt.config.ts` in the i18n configuration
3. Update navigation links and URL structure as needed

## 📱 Device Compatibility

The application includes detailed instructions for using generated GPX files on:

- **Sports Watches**: Garmin, Coros, Apple Watch, Polar, Suunto
- **Smartphone Apps**: Strava, Komoot, AllTrails, ViewRanger/Outdooractive
- **Navigation Apps**: Most GPX-compatible applications

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and test thoroughly
4. **Commit your changes**: `git commit -m 'Add amazing feature'`
5. **Push to the branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Areas for Contribution

- 🌍 **Translations**: Add support for new languages
- 🎨 **UI/UX**: Improve the user interface and experience
- 🐛 **Bug Fixes**: Help identify and fix issues
- 📱 **Mobile**: Enhance mobile experience
- 🗺️ **Maps**: Add new map providers or improve routing
- 📚 **Documentation**: Improve guides and instructions

## 🐛 Bug Reports & Feature Requests

Please use GitHub Issues to:

- Report bugs with detailed reproduction steps
- Request new features with clear use cases
- Suggest improvements to existing functionality

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenRouteService** for providing the excellent routing API
- **OpenStreetMap** community for the detailed map data
- **Nuxt.js** team for the amazing framework
- **Tailwind CSS** and **DaisyUI** for the beautiful styling system
- **Leaflet** for the robust mapping library

## 🌟 Support the Project

If you find this project useful:

- ⭐ Star the repository
- 🐛 Report bugs and suggest features
- 🤝 Contribute code or translations
- 📢 Share it with fellow runners and cyclists!

## 📞 Contact

- **GitHub Issues**: For bug reports and feature requests
- **Discussions**: For questions and community support

---

_Made with ❤️ for the running and cycling community_
