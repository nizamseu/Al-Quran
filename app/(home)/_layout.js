import { Stack } from "expo-router";
import React from "react";

const _layout = () => {
    return (
        <Stack>
            <Stack.Screen name="book" options={{ headerShown: false }} />
            <Stack.Screen name="hadis" options={{ headerShown: false }} />
        </Stack>
    );
};

export default _layout;
