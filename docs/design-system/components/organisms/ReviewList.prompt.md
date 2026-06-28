ReviewList — the reviews organism: an average + distribution summary over a list of `ReviewItem` molecules, with loading and empty states.

```jsx
<ReviewList average={4.9} total={213} distribution={[88, 9, 2, 1, 0]}
  reviews={reviews} loading={isLoading} onMore={loadMore} />
```

`distribution` is 5 percentages [5★…1★]. Composes Rating + ReviewItem (+ Skeleton / EmptyState).
