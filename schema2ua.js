(function ($, ga) {

    /**
     * Our API
     *
     * @param options
     * @constructor
     */
    function Schema2UA(options) {
        options = options ? options : {};

        // Necessary for not hitting the 8192 bytes payload limit
        this.maxProductsPerPage = options.maxProductsPerPage || 35;
    };

    /**
     * Convert product DOM representation to google analytics product object
     *
     * @param $product
     * @returns {{name: *}}
     */
    Schema2UA.prototype.convertToProductObject = function ($product) {
        var name = $product.find("[itemprop='name']:first").text(),
            brand = $product.find("[itemprop='brand']:first [itemprop='name']").text(),
            $list = $product.closest("[itemtype='http://schema.org/ItemList']"),
            $offers = $product.find("[itemscope][itemtype='http://schema.org/Offer']");

        if (name && name.trim() !== '') {
            var product = {
                name: name
                // FIXME
                // Use http://schema.org/productID for id ? or SKU ? or a configurable option ?
            };

            if ($list) {
                var listName = $list.find("[itemprop='name']:first").text();
                if (listName && listName.trim() !== '') {
                    var position = $list.find("[itemscope][itemtype='http://schema.org/Product']").index($product);
                    product['list'] = listName;
                    product['position'] = position;
                }
            }

            if (brand && brand.trim() !== '') {
                product['brand'] = brand;
            }

            if ($offers.length === 1) {
                // For now only provide a price for products for which there is exactly one offer
                var price = $offers.find("[itemprop='price']:first").attr('content');
                product['price'] = price;
            }

            return product;
        }
    };

    Schema2UA.prototype.findProducts = function (selector) {
        var $selector = typeof selector !== 'undefined' ? $(selector) : $(document),
            self = this;
        return $selector.find("[itemscope][itemtype='http://schema.org/Product']").map(function () {
            return self.convertToProductObject($(this));
        }).toArray();
    };

    Schema2UA.prototype.trackDetail = function (selector) {
        var product = this.convertToProductObject(selector),
            ga = window[window['GoogleAnalyticsObject'] || 'ga'];
        ga('ec:addProduct', product);
        ga('ec:setAction', 'detail');
    };

    Schema2UA.prototype.trackImpressions = function (selector) {
        var products = this.findProducts(selector).slice(0, this.maxProductsPerPage),
            ga = window[window['GoogleAnalyticsObject'] || 'ga'];
        products.forEach(function (product) {
            ga('ec:addImpression', product);
        });
    };

    // Export
    window.Schema2UA = Schema2UA;

    /**
     * Bridge provider for Google UA
     *
     * @param tracker
     * @param options
     * @constructor
     */
    function Schema2UAProvider(tracker, options) {
        Schema2UA.call(this, options);
    };
    Schema2UAProvider.prototype = Object.create(Schema2UA.prototype);

    ga('provide', 'schema2ua', Schema2UAProvider);

})(window.jQuery || window.Zepto || window.$, window[window['GoogleAnalyticsObject'] || 'ga']);
