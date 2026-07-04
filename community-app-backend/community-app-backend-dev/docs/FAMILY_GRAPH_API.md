# Family Graph API Documentation

Base URL: `http://localhost:4002/api/family-graph`

All routes require JWT Authentication (`Authorization: Bearer <token>`).

## 1. Add Relationship
**Endpoint**: `POST /relationship`

**Request Body**:
```json
{
  "to_member_uuid": "mem-002-uuid",
  "relationship_label": "father"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Relationship added successfully",
  "data": {
    "uuidForward": "uuid-1",
    "uuidInverse": "uuid-2"
  }
}
```
*Note: Automatically creates the inverse relationship based on the label (e.g., father -> son).*

## 2. Get My Relationships
**Endpoint**: `GET /me`

**Response**:
```json
{
  "success": true,
  "message": "Relationships fetched successfully",
  "data": [
    {
      "relationship_uuid": "uuid-1",
      "relationship_label": "father",
      "from_first_name": "Rajesh",
      "to_first_name": "Amit",
      ...
    }
  ]
}
```

## 3. Get Relationships for a Member
**Endpoint**: `GET /member/:memberUuid`

Returns the same format as `/me`, but for a specific member.

## 4. Get Family Tree
**Endpoint**: `GET /tree/:memberUuid?depth=2`

Returns nodes and edges for visualizing the family tree.

**Response**:
```json
{
  "success": true,
  "message": "Family tree fetched successfully",
  "data": {
    "nodes": [
      {
        "id": 1,
        "member_uuid": "uuid",
        "name": "Rajesh",
        "photo": null
      }
    ],
    "edges": [
      {
        "from": 1,
        "to": 2,
        "label": "father"
      }
    ]
  }
}
```

## 5. Get Pending Relationships (Admin Only)
**Endpoint**: `GET /pending`

Returns relationships where `is_verified = 0`.

## 6. Approve Relationship (Admin Only)
**Endpoint**: `PUT /relationship/:relationshipUuid/approve`

## 7. Reject Relationship (Admin Only)
**Endpoint**: `PUT /relationship/:relationshipUuid/reject`

## 8. Delete Relationship
**Endpoint**: `DELETE /relationship/:relationshipUuid`

Deletes the relationship (and its inverse effectively by soft deleting). Only the admin or the creator of the relationship can delete it.
