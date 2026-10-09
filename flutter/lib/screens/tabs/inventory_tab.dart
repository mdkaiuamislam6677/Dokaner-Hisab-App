import 'package:flutter/material.dart';
import '../../models/product.dart';
import '../../services/firestore_service.dart';

class InventoryTab extends StatefulWidget {
  const InventoryTab({Key? key}) : super(key: key);

  @override
  State<InventoryTab> createState() => _InventoryTabState();
}

class _InventoryTabState extends State<InventoryTab> {
  final FirestoreService _firestoreService = FirestoreService();
  String _searchQuery = '';

  void _showProductDialog([Product? existing]) {
    final nameController = TextEditingController(text: existing?.name ?? '');
    final categoryController = TextEditingController(text: existing?.category ?? 'সাধারণ');
    final buyPriceController = TextEditingController(text: existing != null ? existing.buyPrice.toString() : '');
    final wholesaleController = TextEditingController(text: existing != null ? existing.wholesalePrice.toString() : '');
    final retailController = TextEditingController(text: existing != null ? existing.retailPrice.toString() : '');
    final stockController = TextEditingController(text: existing != null ? existing.stockQuantity.toString() : '');
    final unitController = TextEditingController(text: existing?.unit ?? 'পিস');

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF111827),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text(
          existing == null ? 'নতুন পণ্য যোগ করুন' : 'পণ্য তথ্য পরিবর্তন',
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameController,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(labelText: 'পণ্যের নাম *', labelStyle: TextStyle(color: Colors.grey)),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: categoryController,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(labelText: 'ক্যাটাগরি', labelStyle: TextStyle(color: Colors.grey)),
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: buyPriceController,
                      keyboardType: TextInputType.number,
                      style: const TextStyle(color: Colors.white),
                      decoration: const InputDecoration(labelText: 'কেনা দাম (৳) *', labelStyle: TextStyle(color: Colors.grey)),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: TextField(
                      controller: wholesaleController,
                      keyboardType: TextInputType.number,
                      style: const TextStyle(color: Colors.white),
                      decoration: const InputDecoration(labelText: 'পাইকারি (৳)', labelStyle: TextStyle(color: Colors.grey)),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: retailController,
                      keyboardType: TextInputType.number,
                      style: const TextStyle(color: Colors.white),
                      decoration: const InputDecoration(labelText: 'খুচরা দাম (৳) *', labelStyle: TextStyle(color: Colors.grey)),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: TextField(
                      controller: stockController,
                      keyboardType: TextInputType.number,
                      style: const TextStyle(color: Colors.white),
                      decoration: const InputDecoration(labelText: 'স্টক পরিমাণ *', labelStyle: TextStyle(color: Colors.grey)),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              TextField(
                controller: unitController,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(labelText: 'একক (পিস / কেজি / লিটার)', labelStyle: TextStyle(color: Colors.grey)),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('বাতিল', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981)),
            onPressed: () async {
              final name = nameController.text.trim();
              final buyPrice = double.tryParse(buyPriceController.text.trim()) ?? 0.0;
              final retailPrice = double.tryParse(retailController.text.trim()) ?? 0.0;
              final wholesalePrice = double.tryParse(wholesaleController.text.trim()) ?? buyPrice;
              final stock = int.tryParse(stockController.text.trim()) ?? 0;
              final unit = unitController.text.trim().isEmpty ? 'পিস' : unitController.text.trim();
              final cat = categoryController.text.trim().isEmpty ? 'সাধারণ' : categoryController.text.trim();

              if (name.isEmpty) return;

              final product = Product(
                id: existing?.id ?? '',
                name: name,
                category: cat,
                buyPrice: buyPrice,
                wholesalePrice: wholesalePrice,
                retailPrice: retailPrice,
                stockQuantity: stock,
                unit: unit,
                updatedAt: DateTime.now(),
              );

              if (existing == null) {
                await _firestoreService.addProduct(product);
              } else {
                await _firestoreService.updateProduct(product);
              }

              if (ctx.mounted) Navigator.pop(ctx);
            },
            child: const Text('সংরক্ষণ করুন', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Search & Add Bar
        Container(
          padding: const EdgeInsets.all(16),
          color: const Color(0xFF0F172A),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  style: const TextStyle(color: Colors.white, fontSize: 14),
                  decoration: InputDecoration(
                    hintText: 'পণ্য অনুসন্ধান করুন...',
                    hintStyle: TextStyle(color: Colors.grey.shade500),
                    prefixIcon: const Icon(Icons.search, color: Color(0xFF10B981)),
                    filled: true,
                    fillColor: const Color(0xFF1E293B),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                  ),
                  onChanged: (val) {
                    setState(() {
                      _searchQuery = val.trim().toLowerCase();
                    });
                  },
                ),
              ),
              const SizedBox(width: 12),
              ElevatedButton.icon(
                onPressed: () => _showProductDialog(),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF10B981),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                  shape: BorderRadius.circular(12),
                ),
                icon: const Icon(Icons.add, size: 20),
                label: const Text('পণ্য যোগ', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ),

        // Product Stream List
        Expanded(
          child: StreamBuilder<List<Product>>(
            stream: _firestoreService.getProductsStream(),
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator(color: Color(0xFF10B981)));
              }

              final products = snapshot.data ?? [];
              final filtered = products.where((p) {
                if (_searchQuery.isEmpty) return true;
                return p.name.toLowerCase().contains(_searchQuery) ||
                    p.category.toLowerCase().contains(_searchQuery);
              }).toList();

              if (filtered.isEmpty) {
                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.inventory_2_outlined, size: 64, color: Colors.grey.shade600),
                      const SizedBox(height: 16),
                      Text(
                        _searchQuery.isEmpty ? 'কোনো পণ্য নেই! নতুন পণ্য যোগ করুন।' : 'কোনো পণ্য পাওয়া যায়নি।',
                        style: TextStyle(color: Colors.grey.shade400, fontSize: 16),
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton.icon(
                        onPressed: () => _showProductDialog(),
                        style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981)),
                        icon: const Icon(Icons.add, color: Colors.white),
                        label: const Text('প্রথম পণ্য যুক্ত করুন', style: TextStyle(color: Colors.white)),
                      )
                    ],
                  ),
                );
              }

              return ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: filtered.length,
                separatorBuilder: (_, __) => const SizedBox(height: 10),
                itemBuilder: (context, index) {
                  final p = filtered[index];
                  final isLow = p.stockQuantity <= p.minStockAlert;

                  return Container(
                    decoration: BoxDecoration(
                      color: const Color(0xFF111827),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isLow ? Colors.amber.withOpacity(0.3) : Colors.white.withOpacity(0.06),
                      ),
                    ),
                    padding: const EdgeInsets.all(14),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            color: isLow ? const Color(0xFF78350F) : const Color(0xFF064E3B),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Icon(
                            isLow ? Icons.warning_amber_rounded : Icons.check_circle_outline,
                            color: isLow ? Colors.amber : const Color(0xFF10B981),
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                p.name,
                                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                              ),
                              const SizedBox(height: 4),
                              Row(
                                children: [
                                  Text(
                                    'স্টক: ${p.stockQuantity} ${p.unit}',
                                    style: TextStyle(
                                      color: isLow ? Colors.amber : const Color(0xFF10B981),
                                      fontWeight: FontWeight.w600,
                                      fontSize: 12,
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Text(
                                    'খুচরা: ৳${p.retailPrice.toStringAsFixed(0)}',
                                    style: const TextStyle(color: Colors.cyanAccent, fontSize: 12),
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    'পাইকারি: ৳${p.wholesalePrice.toStringAsFixed(0)}',
                                    style: TextStyle(color: Colors.grey.shade400, fontSize: 11),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.edit_outlined, color: Colors.cyanAccent, size: 20),
                          onPressed: () => _showProductDialog(p),
                        ),
                        IconButton(
                          icon: const Icon(Icons.delete_outline, color: Colors.roseAccent, size: 20),
                          onPressed: () async {
                            final confirm = await showDialog<bool>(
                              context: context,
                              builder: (ctx) => AlertDialog(
                                backgroundColor: const Color(0xFF111827),
                                title: const Text('পণ্য ডিলিট করবেন?', style: TextStyle(color: Colors.white)),
                                content: Text('${p.name} পণ্যটি মুছে ফেলতে চান?', style: const TextStyle(color: Colors.grey)),
                                actions: [
                                  TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('না')),
                                  ElevatedButton(
                                    style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                                    onPressed: () => Navigator.pop(ctx, true),
                                    child: const Text('হ্যাঁ, মুছুন'),
                                  ),
                                ],
                              ),
                            );
                            if (confirm == true) {
                              await _firestoreService.deleteProduct(p.id);
                            }
                          },
                        ),
                      ],
                    ),
                  );
                },
              );
            },
          ),
        ),
      ],
    );
  }
}
