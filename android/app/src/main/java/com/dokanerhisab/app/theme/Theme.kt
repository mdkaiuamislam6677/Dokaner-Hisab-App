package com.dokanerhisab.app.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val DarkColorScheme = darkColorScheme(
    primary = Emerald500,
    onPrimary = DarkBg,
    primaryContainer = Emerald700,
    onPrimaryContainer = TextPrimary,
    secondary = Cyan500,
    onSecondary = DarkBg,
    background = DarkBg,
    onBackground = TextPrimary,
    surface = SurfaceCard,
    onSurface = TextPrimary,
    surfaceVariant = SurfaceCardElevated,
    onSurfaceVariant = TextSecondary,
    outline = BorderSubtle,
    error = Rose500,
    onError = TextPrimary
)

@Composable
fun DokanerHisabTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        typography = Typography,
        content = content
    )
}
