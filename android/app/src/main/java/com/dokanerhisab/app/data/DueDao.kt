package com.dokanerhisab.app.data

import androidx.room.*
import com.dokanerhisab.app.model.DueItem
import kotlinx.coroutines.flow.Flow

@Dao
interface DueDao {
    @Query("SELECT * FROM dues ORDER BY date DESC, id DESC")
    fun getAllDues(): Flow<List<DueItem>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdate(due: DueItem)

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insertAll(dues: List<DueItem>)

    @Delete
    suspend fun delete(due: DueItem)

    @Query("UPDATE dues SET paidAmount = paidAmount + :payAmount, dueAmount = dueAmount - :payAmount, status = CASE WHEN (dueAmount - :payAmount) <= 0 THEN 'paid' ELSE 'partial' END WHERE id = :dueId")
    suspend fun recordPayment(dueId: String, payAmount: Double): Int

    @Query("SELECT COUNT(*) FROM dues")
    suspend fun getCount(): Int

    @Query("DELETE FROM dues WHERE id LIKE 'due_%'")
    suspend fun clearDemoDues()
}
