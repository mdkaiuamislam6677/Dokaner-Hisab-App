package com.dokanerhisab.app.data

import androidx.room.*
import com.dokanerhisab.app.model.Expense
import kotlinx.coroutines.flow.Flow

@Dao
interface ExpenseDao {
    @Query("SELECT * FROM expenses ORDER BY date DESC, id DESC")
    fun getAllExpenses(): Flow<List<Expense>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdate(expense: Expense)

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insertAll(expenses: List<Expense>)

    @Delete
    suspend fun delete(expense: Expense)

    @Query("SELECT COUNT(*) FROM expenses")
    suspend fun getCount(): Int

    @Query("DELETE FROM expenses WHERE id LIKE 'exp_%'")
    suspend fun clearDemoExpenses()
}
