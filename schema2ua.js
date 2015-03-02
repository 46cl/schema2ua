(function ($, ga) {

    function Schema2UA(tracker) {

        $("[itemscope][itemtype='http://schema.org/Product']").each(function () {

            var $product = $(this),
                name = $product.find("[itemprop='name']:first").text(),
                brand = $product.find("[itemprop='brand']:first").text(),
                $list = $product.closest("[itemtype='http://schema.org/ItemList']"),
                $offers = $product.find("[itemscope][itemtype='http://schema.org/Offer']");

            if (name && name.trim() !== '') {
                var impression = {
                    name: name
                };

                if ($list) {
                    var listName = $list.find("[itemprop='name']:first").text();
                    if (listName && listName.trim() !== '') {
                        var position = $list.find("[itemscope][itemtype='http://schema.org/Product']").index($product);
                        impression['list'] = listName;
                        impression['position'] = position;
                    }
                }
                
                if (brand && brand.trim() !== '') {
                    impression['brand'] = brand;
                }

                if ($offers.length === 1) {
                    // For now only provide a price for products for which there is exactly one offer
                    var price = $offers.find("[itemprop='price']:first").attr('content');
                    impression['price'] = price;
                }

                ga('ec:addImpression', impression);
            }
        });
    }

    ga('provide', 'schema2ua', Schema2UA);

})(window.jQuery || window.Zepto || window.$, window.ga);

