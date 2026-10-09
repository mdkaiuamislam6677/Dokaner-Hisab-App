package com.dokanerhisab.app.data

import androidx.room.*
import com.dokanerhisab.app.model.MiniKhataItem
import kotlinx.coroutines.flow.Flow

@Dao
interface MiniKhataDao {
    @Query("SELECT * FROM mini_khata ORDER BY date DESC, id DESC")
    fun getAllMiniKhata(): Flow<List<MiniKhataItem>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdate(item: MiniKhataItem)

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insertAll(items: List<MiniKhataItem>)

    @Delete
    suspend fun delete(item: MiniKhataItem)

    @Query("UPDATE mini_khata SET paidAmount = amount, dueAmount = 0.0, status = 'paid' WHERE id = :id")
    suspend fun markAsPaid(id: String)

    @Query("SELECT COUNT(*) FROM mini_khata")
    suspend fun getCount(): Int

    @Query("DELETE FROM mini_khata WHERE id LIKE 'mkhata_%'")
    suspend fun clearDemoMiniKhata()
}
