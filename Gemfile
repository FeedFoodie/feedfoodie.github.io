source "https://rubygems.org"

# Core Jekyll engine
gem "jekyll"

# Your site's theme
gem "minima"

# Required for 'jekyll serve' on Ruby 3.0+
gem "webrick", "~> 1.8"

# Your site's plugins
group :jekyll_plugins do
  gem "jekyll-feed"
  gem "jekyll-sitemap"
  gem "jekyll-seo-tag"
  gem "jekyll-paginate-v2"
  gem "jekyll-archives"
end

# Windows-specific gems
platforms :windows, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

# Performance-booster for watching directories on Windows
gem "wdm", "~> 0.1", :platforms => [:windows]