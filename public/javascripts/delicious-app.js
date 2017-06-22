import '../sass/style.scss';

import { $, $$ } from './modules/bling'; // document.querySelector and document.querySelectorAll
import autocomplete from './modules/autocomplete';
import typeAhead from './modules/typeAhead';
import makeMap from './modules/map';
import ajaxHeart from './modules/heart';

autocomplete( $('#address'), $('#lat'), $('#lng'))

typeAhead( $('.search') );

makeMap( $('#map') );

const heartForms = $$('form.heart'); // any form with a class of heart 
heartForms.on('submit', ajaxHeart); // select all forms, when all forms are submitted, call ajaxHeart