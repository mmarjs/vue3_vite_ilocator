import * as d3 from 'd3';

const locale = {
  'decimal': '.',
  'thousands': '\'',
  'grouping': [3],
  'currency': ['CHF ', ''],
};

export const themeColors = {
  primary: '#E5007D',
  secondary: '#A81681',
  accent: '#1E50AD'
};

export const formatNumber = d3
  .formatLocale(locale)
  .format('$,.0f');


export const formatPrice = (n) => {
  let nf;
  if (n < 1000000) {
    nf = d3.formatLocale(locale).format('$,.0f')(n);
  } else {
    nf = d3.formatLocale(locale).format(".3s")(n).replace('M', ' Mio.');
  }
  return nf
}

