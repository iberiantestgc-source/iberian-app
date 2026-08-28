import React from 'react';

import {
    View,
    StyleSheet,
} from 'react-native';

import { theme } from '../../constants/theme';

export default function Card({

    children,

    style,

}: any) {

    return (

        <View

            style={[

                styles.card,

                style,

            ]}

        >

            {children}

        </View>

    );

}

const styles = StyleSheet.create({

    card: {

        backgroundColor: theme.colors.surface,

        borderRadius: theme.radius.lg,

        padding: theme.spacing.lg,

        borderWidth: 1,

        borderColor: theme.colors.border,

        ...theme.shadow.card,

    },

});