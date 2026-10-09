package com.dokanerhisab.app

import android.app.Application
import com.dokanerhisab.app.data.AppDatabase

class DokanApp : Application() {
    val database: AppDatabase by lazy { AppDatabase.getDatabase(this) }

    override fun onCreate() {
        super.onCreate()
        instance = this
    }

    companion object {
        lateinit var instance: DokanApp
            private set
    }
}
