// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Vuetify
import { createVuetify } from 'vuetify'

const homegateTheme = {
  dark: false,
  colors: {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    primary: '#E5007D',
    secondary: '#A81681',
    accent: '#1E50AD',
    error: '#B00020',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FB8C00',
  }
};

export default createVuetify({
  theme: {
    defaultTheme: 'homegateTheme',
    themes: {
      homegateTheme,
    }
  }
})