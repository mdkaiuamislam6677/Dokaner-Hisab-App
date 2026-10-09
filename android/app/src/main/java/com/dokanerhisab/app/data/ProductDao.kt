package com.dokanerhisab.app.data

import androidx.room.*
import com.dokanerhisab.app.model.Product
import kotlinx.coroutines.flow.Flow

@Dao
interface ProductDao {
    @Query("SELECT * FROM products ORDER BY nameBn ASC")
    fun getAllProducts(): Flow<List<Product>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdate(product: Product)

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insertAll(products: List<Product>)

    @Delete
    suspend fun delete(product: Product)

    @Query("UPDATE products SET stock = stock - :quantity WHERE id = :productId AND stock >= :quantity")
    suspend fun deductStock(productId: String, quantity: Int): Int

    @Query("SELECT COUNT(*) FROM products")
    suspend fun getCount(): Int

    @Query("DELETE FROM products WHERE id LIKE 'prod_%'")
    suspend fun clearDemoProducts()
}
