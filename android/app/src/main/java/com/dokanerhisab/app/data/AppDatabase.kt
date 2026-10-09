package com.dokanerhisab.app.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.dokanerhisab.app.model.DueItem
import com.dokanerhisab.app.model.Expense
import com.dokanerhisab.app.model.MiniKhataItem
import com.dokanerhisab.app.model.Product

@Database(
    entities = [Product::class, Expense::class, DueItem::class, MiniKhataItem::class],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun productDao(): ProductDao
    abstract fun expenseDao(): ExpenseDao
    abstract fun dueDao(): DueDao
    abstract fun miniKhataDao(): MiniKhataDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "dokaner_hisab_db"
                ).build()
                INSTANCE = instance
                instance
            }
        }
    }
}
