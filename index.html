{%- assign current_month = "now" | date: "%-m" | plus: 0 -%}
{%- assign current_year = "now" | date: "%Y" | plus: 0 -%}

{%- if current_month == 1 -%}
  {%- assign prev_month = 12 -%}
  {%- assign prev_month_year = current_year | minus: 1 -%}
{%- else -%}
  {%- assign prev_month = current_month | minus: 1 -%}
  {%- assign prev_month_year = current_year -%}
{%- endif -%}

{%- assign recent_posts = site.posts | where_exp: "post",
  "((post.date | date: '%Y' | plus: 0) == current_year and (post.date | date: '%-m' | plus: 0) == current_month) or ((post.date | date: '%Y' | plus: 0) == prev_month_year and (post.date | date: '%-m' | plus: 0) == prev_month)"
-%}
---
layout: home
title: "Northern Blade Translations"
pagination:
  enabled: true
  docs_to_paginate: recent_posts
  per_page: 20
  limit: 0
  sort_field: 'date'
  sort_reverse: true
---