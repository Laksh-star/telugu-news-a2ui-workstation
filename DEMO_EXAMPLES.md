# Demo Examples

Try these sample inputs to test the Telugu Short-News Creation Workstation!

## Example 1: Technology News (Notes)

**Input Type:** Notes

**Content:**
```
Artificial Intelligence breakthrough by Indian researchers at IIT Madras.
New deep learning algorithm improves medical diagnosis accuracy by 45%.
Published in Nature magazine. Will revolutionize healthcare in rural areas.
Team led by Dr. Sharma. Funded by Department of Science and Technology.
```

**Expected Output:**
- 3 Telugu headline options about AI breakthrough
- 15-second script explaining the discovery
- Relevant hashtags like #AI #IITMadras #Healthcare
- Thumbnail checklist

---

## Example 2: Sports News (Transcript)

**Input Type:** Transcript

**Content:**
```
Breaking news from cricket world. India wins historic test series in Australia.
The team showed exceptional performance with both bat and ball.
Captain's leadership and young players' energy made the difference.
This is India's third consecutive series win down under.
Cricket fans across the nation are celebrating this remarkable achievement.
```

**Expected Output:**
- Headlines about cricket victory
- Telugu script for sports news
- Cricket-related hashtags
- Thumbnail elements checklist

---

## Example 3: Cultural Event (Notes)

**Input Type:** Notes

**Content:**
```
Sankranti celebrations begin across Telangana and Andhra Pradesh.
Traditional festivities include kite flying, bonfires, and special dishes.
Thousands gather at temples for special prayers.
Cultural programs showcase classical dance and music.
Three-day state holiday declared.
```

**Expected Output:**
- Festival-themed headlines in Telugu
- Cultural event script
- Festival hashtags
- Thumbnail design checklist

---

## Example 4: Economic News (Transcript)

**Input Type:** Transcript

**Content:**
```
Indian stock market reaches new all-time high today.
Sensex crosses 75,000 mark for the first time in history.
Experts attribute this growth to strong corporate earnings and foreign investments.
Technology and banking sectors leading the rally.
Investors showing confidence in India's economic growth story.
```

**Expected Output:**
- Business headlines in Telugu
- Economic news script
- Finance hashtags
- Professional thumbnail checklist

---

## Example 5: Environmental News (Notes)

**Input Type:** Notes

**Content:**
```
Hyderabad launches mega tree plantation drive.
Target: 1 million trees in next 6 months.
School students and volunteers participating.
Focus on native species and fruit trees.
Part of city's climate action plan.
```

**Expected Output:**
- Environment-focused headlines
- Green initiative script
- Eco-friendly hashtags
- Nature-themed thumbnail checklist

---

## Testing Regeneration Features

After generating any example:

1. **Test Headlines Regeneration:**
   - Click "🔄 హెడ్‌లైన్స్ రీజెనరేట్ చేయండి / Regenerate Headlines"
   - Notice only headlines change, script and hashtags remain same

2. **Test Script Regeneration:**
   - Switch to "15-సెకన్ల స్క్రిప్ట్ / Script" tab
   - Click regenerate button
   - New script appears with different wording

3. **Test Hashtags Regeneration:**
   - Go to "హ్యాష్‌ట్యాగ్స్ / Hashtags" tab
   - Click regenerate
   - New set of hashtags generated

4. **Test Thumbnail Checklist:**
   - Open "థంబ్‌నెయిల్ / Thumbnail" tab
   - Check/uncheck items
   - Use as workflow tracker

5. **Test Approval:**
   - Click "ఆమోదించండి & ఎగ్జిట్ / Approve & Export"
   - Check browser console for export data

---

## Advanced Testing

### Test Multiple News Stories

Generate 3-4 different stories in succession and notice:
- Each gets unique newsId
- Regeneration works independently
- Server maintains state for each story

### Test Long Form Input

Try pasting a full news article (200-300 words) and see how the generator handles it.

### Test Edge Cases

1. **Empty Input**: Should show alert
2. **Very Short Input**: "India wins" - see minimal content generation
3. **Mixed Language**: Input with both English and Telugu
4. **Special Characters**: URLs with parameters, quotes, etc.

---

## API Testing with cURL

### Generate News
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "input": "India launches new satellite for weather monitoring",
    "type": "notes"
  }'
```

### Regenerate Section
```bash
curl -X POST http://localhost:3000/api/regenerate \
  -H "Content-Type: application/json" \
  -d '{
    "newsId": "1734352114850",
    "section": "headlines"
  }'
```

### Approve News
```bash
curl -X POST http://localhost:3000/api/approve \
  -H "Content-Type: application/json" \
  -d '{
    "newsId": "1734352114850"
  }'
```

---

## Expected A2UI JSON Structure

When you generate news, the server returns this structure:

```json
{
  "surface": {
    "id": "main",
    "components": [
      {
        "id": "c0",
        "type": "Card",
        "children": [...]
      },
      {
        "id": "c1",
        "type": "Tabs",
        "children": [
          {
            "id": "c2",
            "type": "Tab",
            "label": "హెడ్‌లైన్స్ / Headlines",
            "children": [...]
          }
        ]
      }
    ]
  },
  "dataModel": {
    "newsId": "1734352114850",
    "content": {
      "headlines": [...],
      "script": {...},
      "hashtags": [...],
      "thumbnailChecklist": [...]
    }
  }
}
```

This demonstrates the A2UI protocol's separation of UI structure (`surface`) and data (`dataModel`).
