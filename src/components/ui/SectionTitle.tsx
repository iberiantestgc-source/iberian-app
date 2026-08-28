import React from 'react';

import {

Text,

StyleSheet,

} from 'react-native';

import { theme } from '../../constants/theme';

export default function SectionTitle({

title,

}: any){

return(

<Text style={styles.title}>

{title}

</Text>

);

}

const styles=StyleSheet.create({

title:{

fontSize:18,

fontWeight:'700',

color:theme.colors.text,

marginBottom:14,

marginTop:8,

}

});