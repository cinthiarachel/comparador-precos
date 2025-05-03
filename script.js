let productCount = 2;
        
        // Adicionar novo produto
        function addProduct() {
            productCount++;
            const newProduct = document.createElement('div');
            newProduct.className = 'product';
            newProduct.id = `product-${productCount}`;
            newProduct.innerHTML = `
                <h3>Produto ${productCount}</h3>
                <div class="input-group">
                    <label for="product-name-${productCount}">Nome do Produto</label>
                    <input type="text" id="product-name-${productCount}" placeholder="Ex: Sabonete líquido">
                </div>
                <div class="input-group">
                    <label for="product-quantity-${productCount}">Quantidade</label>
                    <input type="number" id="product-quantity-${productCount}" step="0.01" min="0.01" value="100">
                </div>
                <div class="input-group">
                    <label for="product-unit-${productCount}">Unidade de Medida</label>
                    <select id="product-unit-${productCount}">
                        <option value="ml">Mililitros (ml)</option>
                        <option value="l">Litros (l)</option>
                        <option value="g">Gramas (g)</option>
                        <option value="kg">Quilogramas (kg)</option>
                        <option value="un">Unidades</option>
                        <option value="m">Metros (m)</option>
                        <option value="cm">Centímetros (cm)</option>
                    </select>
                </div>
                <div class="input-group">
                    <label for="product-price-${productCount}">Preço (R$)</label>
                    <input type="number" id="product-price-${productCount}" step="0.01" min="0.01" value="10.00">
                </div>
                <button class="remove-product" onclick="removeProduct(${productCount})">Remover Produto</button>
            `;
            document.getElementById('products-container').appendChild(newProduct);
        }
        
        // Remover produto
        function removeProduct(id) {
            if (document.querySelectorAll('.product').length <= 2) {
                alert('Você precisa ter pelo menos dois produtos para comparar.');
                return;
            }
            const productToRemove = document.getElementById(`product-${id}`);
            productToRemove.remove();
        }
        
        // Calcular melhor opção
        document.getElementById('calculate').addEventListener('click', function() {
            const products = [];
            let allFieldsValid = true;
            
            // Coletar dados dos produtos
            document.querySelectorAll('.product').forEach((productDiv, index) => {
                const id = productDiv.id.split('-')[1];
                const name = document.getElementById(`product-name-${id}`).value.trim() || `Produto ${index + 1}`;
                const quantity = parseFloat(document.getElementById(`product-quantity-${id}`).value);
                const unit = document.getElementById(`product-unit-${id}`).value;
                const price = parseFloat(document.getElementById(`product-price-${id}`).value);
                
                if (isNaN(quantity) || isNaN(price) || quantity <= 0 || price <= 0) {
                    allFieldsValid = false;
                    return;
                }
                
                // Converter para unidades padrão para comparação
                let standardQuantity = quantity;
                switch(unit) {
                    case 'l': standardQuantity = quantity * 1000; break; // litro para ml
                    case 'kg': standardQuantity = quantity * 1000; break; // kg para g
                    case 'cm': standardQuantity = quantity / 100; break; // cm para m
                }
                
                const unitPrice = price / standardQuantity;
                
                products.push({
                    id,
                    name,
                    quantity,
                    unit,
                    price,
                    standardQuantity,
                    unitPrice
                });
            });
            
            if (!allFieldsValid || products.length < 2) {
                alert('Por favor, preencha todos os campos corretamente com valores positivos e compare pelo menos dois produtos.');
                return;
            }
            
            // Ordenar por preço por unidade (do mais barato ao mais caro)
            products.sort((a, b) => a.unitPrice - b.unitPrice);
            
            // Exibir resultados
            const resultsContainer = document.getElementById('results-container');
            resultsContainer.innerHTML = '';
            
            products.forEach((product, index) => {
                const resultItem = document.createElement('div');
                resultItem.className = 'result-item';
                
                // Formatando o preço por unidade baseado na unidade original
                let unitDescription = product.unit;
                let unitPriceDisplay = product.unitPrice;
                
                // Ajuste para exibição de unidades convertidas
                switch(product.unit) {
                    case 'l':
                        unitPriceDisplay = product.price / product.quantity; // preço por litro
                        break;
                    case 'kg':
                        unitPriceDisplay = product.price / product.quantity; // preço por kg
                        break;
                    case 'cm':
                        unitPriceDisplay = product.price / (product.quantity / 100); // preço por m
                        unitDescription = 'm';
                        break;
                    default:
                        unitPriceDisplay = product.unitPrice;
                }
                
                resultItem.innerHTML = `
                    <h3>${product.name}</h3>
                    <p>${product.quantity}${product.unit} por R$ ${product.price.toFixed(2)}</p>
                    <p>Preço por ${unitDescription}: <span class="unit-price">R$ ${unitPriceDisplay.toFixed(4)}</span></p>
                    ${index === 0 ? '<p style="color:#2e7d32;font-weight:bold;">⭐ Melhor custo-benefício</p>' : ''}
                `;
                resultsContainer.appendChild(resultItem);
            });
            
            // Exibir melhor opção
            const bestOption = document.getElementById('best-option');
            const bestProduct = products[0];
            const worstProduct = products[products.length - 1];
            
            // Calcular quanto custaria comprar a quantidade da melhor opção pelo preço unitário da pior opção
            const worstPriceForBestQuantity = (bestProduct.standardQuantity * worstProduct.unitPrice).toFixed(2);
            const economyValue = (worstPriceForBestQuantity - bestProduct.price).toFixed(2);
            const economyPercentage = calculateSavings(products);
            
            bestOption.innerHTML = `
                <p>A melhor opção é <strong>${bestProduct.name}</strong> com:</p>
                <ul>
                    <li>${bestProduct.quantity}${bestProduct.unit} por R$ ${bestProduct.price.toFixed(2)}</li>
                    <li>Preço por ${getBaseUnit(bestProduct.unit)}: R$ ${bestProduct.unitPrice.toFixed(4)}</li>
                    <li>Se comprar ${bestProduct.quantity}${bestProduct.unit} pelo preço unitário da opção mais cara (${worstProduct.name}): R$ ${worstPriceForBestQuantity}</li>
                    <li>Economia real: R$ ${economyValue} (${economyPercentage}%)</li>
                </ul>
            `;
            
            // Mostrar resultados
            document.getElementById('results').style.display = 'block';
        });
        
        // Obter unidade base para exibição
        function getBaseUnit(unit) {
            switch(unit) {
                case 'l': return 'ml';
                case 'kg': return 'g';
                case 'cm': return 'm';
                default: return unit;
            }
        }
        
        // Calcular porcentagem de economia
        function calculateSavings(products) {
            const cheapest = products[0].unitPrice;
            const mostExpensive = products[products.length - 1].unitPrice;
            return ((mostExpensive - cheapest) / mostExpensive * 100).toFixed(2);
        }