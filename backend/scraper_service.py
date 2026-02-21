import requests
from bs4 import BeautifulSoup
from datetime import datetime, date
import random
import json
import re
from typing import List, Dict, Any

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
}

CATEGORY_IMAGES = {
    "Wellness":  "https://images.unsplash.com/photo-1544367563-12123d8965cd?w=600&q=80",
    "Creative":  "https://images.unsplash.com/photo-1565193566173-0923d5a63126?w=600&q=80",
    "Music":     "https://images.unsplash.com/photo-1514525253440-b393452e8d26?w=600&q=80",
    "Social":    "https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=600&q=80",
    "Workshop":  "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80",
    "Sports":    "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80",
    "Food":      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80",
    "Art":       "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&q=80",
    "Dance":     "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=600&q=80",
    "General":   "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80",
}

HOBBY_KEYWORDS = [
    "yoga", "art", "pottery", "music", "dance", "workshop", "cooking",
    "painting", "meditation", "fitness", "craft", "photography", "hiking",
    "book club", "running", "drawing", "singing", "theatre", "gaming",
    "gardening", "knitting", "writing", "film", "comedy", "jazz"
]

def classify_category(text: str) -> str:
    text = text.lower()
    if any(w in text for w in ["yoga", "meditation", "wellness", "fitness", "run", "hike", "zumba"]):
        return "Wellness"
    if any(w in text for w in ["art", "paint", "pottery", "craft", "draw", "sketch", "photography"]):
        return "Creative"
    if any(w in text for w in ["music", "concert", "jazz", "singing", "band", "guitar", "drum"]):
        return "Music"
    if any(w in text for w in ["dance", "salsa", "tango", "ballet", "bollywood", "hip hop"]):
        return "Dance"
    if any(w in text for w in ["cook", "bake", "food", "wine", "cocktail", "cuisine"]):
        return "Food"
    if any(w in text for w in ["sport", "cricket", "football", "badminton", "cycling", "swim"]):
        return "Sports"
    if any(w in text for w in ["workshop", "class", "learn", "course", "session", "seminar"]):
        return "Workshop"
    return "Social"

def get_category_image(category: str, text: str = "") -> str:
    return CATEGORY_IMAGES.get(category, CATEGORY_IMAGES["General"])


def scrape_meetup(city: str, category_filter: str = None) -> List[Dict[str, Any]]:
    """
    Scrapes Meetup.com public event search for a given city.
    Uses their search page which is publicly accessible.
    """
    events = []
    city_slug = city.lower().replace(" ", "-").replace(",", "")
    
    # Determine what keywords to search for based on filter
    keywords = HOBBY_KEYWORDS
    if category_filter and category_filter != "All":
        kw_map = {
            "Wellness": ["yoga", "meditation", "fitness"],
            "Creative": ["art", "pottery", "painting"],
            "Music": ["music", "jazz", "concert"],
            "Social": ["social", "meetup", "community"],
            "Dance": ["dance", "salsa"],
            "Workshop": ["workshop", "class"],
        }
        keywords = kw_map.get(category_filter, HOBBY_KEYWORDS)
    
    # Pick 3 random keywords to diversify results
    search_keywords = random.sample(keywords, min(3, len(keywords)))
    
    for kw in search_keywords:
        try:
            url = f"https://www.meetup.com/find/?keywords={kw}&location={city_slug}&source=EVENTS"
            resp = requests.get(url, headers=HEADERS, timeout=8)
            if resp.status_code != 200:
                continue
            
            soup = BeautifulSoup(resp.text, "html.parser")
            
            # Try to extract from JSON-LD structured data
            scripts = soup.find_all("script", type="application/ld+json")
            for script in scripts:
                try:
                    data = json.loads(script.string)
                    items = data if isinstance(data, list) else [data]
                    for item in items:
                        if item.get("@type") == "Event":
                            title = item.get("name", "")
                            if not title:
                                continue
                            start_date = item.get("startDate", "")
                            location = item.get("location", {})
                            loc_name = location.get("name", city) if isinstance(location, dict) else city
                            url_link = item.get("url", "https://meetup.com")
                            image = item.get("image", "")
                            if isinstance(image, list):
                                image = image[0] if image else ""
                            
                            cat = classify_category(title)
                            
                            # Only include if date is in 2026 or future
                            try:
                                event_date = datetime.fromisoformat(start_date.replace("Z", "+00:00"))
                                if event_date.date() < date.today():
                                    continue
                                formatted_date = event_date.strftime("%a %d %b, %I:%M %p")
                            except:
                                formatted_date = start_date[:10] if start_date else "Upcoming"
                            
                            events.append({
                                "id": f"meetup-{hash(title)}",
                                "title": title,
                                "category": cat,
                                "location": loc_name,
                                "time": formatted_date,
                                "attendees": random.randint(5, 60),
                                "image": image or get_category_image(cat),
                                "source": "meetup",
                                "url": url_link
                            })
                except Exception:
                    continue
            
            # Also try scraping event cards directly
            event_cards = soup.select("a[data-testid='event-listing']") or \
                          soup.select("div[data-element-id='event-card']") or \
                          soup.select("li[data-eventid]")
            
            for card in event_cards[:4]:
                try:
                    title_el = card.select_one("h2, h3, [class*='eventName'], [class*='title']")
                    title = title_el.get_text(strip=True) if title_el else ""
                    if not title:
                        continue
                    
                    date_el = card.select_one("time, [class*='date'], [class*='time']")
                    time_str = date_el.get_text(strip=True) if date_el else "Upcoming"
                    
                    link_el = card if card.name == "a" else card.select_one("a")
                    link = link_el.get("href", "") if link_el else ""
                    if link and not link.startswith("http"):
                        link = "https://meetup.com" + link
                    
                    cat = classify_category(title)
                    events.append({
                        "id": f"meetup-card-{hash(title)}",
                        "title": title,
                        "category": cat,
                        "location": city,
                        "time": time_str,
                        "attendees": random.randint(5, 60),
                        "image": get_category_image(cat),
                        "source": "meetup",
                        "url": link or f"https://www.meetup.com/find/?keywords={kw}&location={city_slug}"
                    })
                except Exception:
                    continue
        except Exception as e:
            print(f"Meetup scrape error for '{kw}': {e}")
            continue
    
    return events


def scrape_insider(city: str, category_filter: str = None) -> List[Dict[str, Any]]:
    """
    Scrapes insider.in - India's popular events platform.
    Searches for hobby/workshop events in the given city.
    """
    events = []
    city_slug = city.lower().split(",")[0].strip().replace(" ", "-")
    
    hobby_tags = ["workshops", "fitness", "music", "art", "food-and-drink", "dance", "outdoor"]
    if category_filter and category_filter != "All":
        tag_map = {
            "Wellness": ["fitness", "workshops"],
            "Creative": ["art", "workshops"],
            "Music": ["music"],
            "Social": ["workshops"],
            "Dance": ["dance"],
        }
        hobby_tags = tag_map.get(category_filter, hobby_tags)
    
    for tag in hobby_tags[:3]:
        try:
            url = f"https://insider.in/{city_slug}/{tag}"
            resp = requests.get(url, headers=HEADERS, timeout=8)
            if resp.status_code != 200:
                continue
            
            soup = BeautifulSoup(resp.text, "html.parser")
            
            # insider.in uses these selectors for event cards
            cards = soup.select(".event-card, .card-container, [class*='EventCard'], article[class*='event']")
            
            # Try JSON-LD too
            scripts = soup.find_all("script", type="application/ld+json")
            for script in scripts:
                try:
                    data = json.loads(script.string)
                    items = data if isinstance(data, list) else [data]
                    for item in items:
                        if item.get("@type") == "Event":
                            title = item.get("name", "")
                            if not title:
                                continue
                            start_date = item.get("startDate", "")
                            try:
                                event_date = datetime.fromisoformat(start_date.replace("Z", "+00:00"))
                                if event_date.date() < date.today():
                                    continue
                                formatted_date = event_date.strftime("%a %d %b, %I:%M %p")
                            except:
                                formatted_date = "Upcoming 2026"
                            
                            cat = classify_category(title + " " + tag)
                            image = item.get("image", "")
                            if isinstance(image, list):
                                image = image[0]
                            
                            events.append({
                                "id": f"insider-{hash(title)}",
                                "title": title,
                                "category": cat,
                                "location": item.get("location", {}).get("name", city) if isinstance(item.get("location"), dict) else city,
                                "time": formatted_date,
                                "attendees": random.randint(15, 120),
                                "image": image or get_category_image(cat),
                                "source": "insider.in",
                                "url": item.get("url", url)
                            })
                except Exception:
                    continue
            
            # Scrape visible cards
            for card in cards[:4]:
                try:
                    title_el = card.select_one("h2, h3, h4, .event-name, .title")
                    if not title_el:
                        continue
                    title = title_el.get_text(strip=True)
                    
                    date_el = card.select_one("time, .event-date, .date, [class*='date']")
                    time_str = date_el.get_text(strip=True) if date_el else "Upcoming"
                    
                    img_el = card.select_one("img")
                    image = img_el.get("src", "") or img_el.get("data-src", "") if img_el else ""
                    
                    link_el = card.select_one("a")
                    link = link_el.get("href", "") if link_el else ""
                    if link and not link.startswith("http"):
                        link = "https://insider.in" + link
                    
                    cat = classify_category(title + " " + tag)
                    events.append({
                        "id": f"insider-card-{hash(title)}",
                        "title": title,
                        "category": cat,
                        "location": city,
                        "time": time_str,
                        "attendees": random.randint(15, 120),
                        "image": image or get_category_image(cat),
                        "source": "insider.in",
                        "url": link or url
                    })
                except Exception:
                    continue
        except Exception as e:
            print(f"Insider scrape error for '{tag}' in '{city}': {e}")
            continue
    
    return events


def scrape_events(city: str, category_filter: str = None) -> List[Dict[str, Any]]:
    """
    Master scraper: combines Meetup + insider.in results.
    Falls back to rich dynamic mock data if scraping fails.
    """
    all_events = []
    
    print(f"[Scraper] Searching events in: {city}, category: {category_filter}")
    
    # Try insider.in first (India-specific)
    insider_events = scrape_insider(city, category_filter)
    all_events.extend(insider_events)
    print(f"[Scraper] Insider.in returned {len(insider_events)} events")
    
    # Then meetup
    meetup_events = scrape_meetup(city, category_filter)
    all_events.extend(meetup_events)
    print(f"[Scraper] Meetup returned {len(meetup_events)} events")
    
    # Deduplicate by title
    seen = set()
    unique = []
    for e in all_events:
        key = e["title"].lower().strip()[:40]
        if key not in seen:
            seen.add(key)
            unique.append(e)
    
    if len(unique) >= 3:
        return unique[:12]
    
    # Fallback: generate rich dynamic mock events for the city
    print(f"[Scraper] Not enough results, generating dynamic events for {city}")
    return generate_dynamic_events(city, category_filter)


def generate_dynamic_events(city: str, category_filter: str = None) -> List[Dict[str, Any]]:
    """
    Generates realistic, city-specific events with current 2026 dates.
    Used as fallback when scraping doesn't yield enough results.
    """
    today = date.today()
    
    templates = [
        {"title": f"Sunrise Yoga & Meditation – {city}", "category": "Wellness", "attendees": 18,
         "desc": "Start your weekend with peaceful yoga"},
        {"title": f"Pottery & Clay Workshop – {city}", "category": "Creative", "attendees": 12,
         "desc": "Hands-on beginner pottery class"},
        {"title": f"Live Jazz Evening – {city}", "category": "Music", "attendees": 65,
         "desc": "Live jazz at a cozy venue"},
        {"title": f"Watercolor Painting Class – {city}", "category": "Creative", "attendees": 14,
         "desc": "Learn watercolor from scratch"},
        {"title": f"Zumba Fitness Party – {city}", "category": "Wellness", "attendees": 40,
         "desc": "Fun dance-fitness session"},
        {"title": f"Salsa & Latin Dance Night – {city}", "category": "Social", "attendees": 55,
         "desc": "Salsa lessons + social dancing"},
        {"title": f"Cooking Workshop: Indian Cuisine – {city}", "category": "Social", "attendees": 16,
         "desc": "Learn to cook authentic recipes"},
        {"title": f"Photography Walk – {city}", "category": "Creative", "attendees": 22,
         "desc": "Street photography guided walk"},
        {"title": f"Open Mic Night – {city}", "category": "Music", "attendees": 80,
         "desc": "Perform or watch live talent"},
        {"title": f"Book Club: Women in Fiction – {city}", "category": "Social", "attendees": 9,
         "desc": "Monthly women's book discussion"},
        {"title": f"Acrylic Art Workshop – {city}", "category": "Creative", "attendees": 11,
         "desc": "Create your own canvas art"},
        {"title": f"Trail Running Group – {city}", "category": "Wellness", "attendees": 28,
         "desc": "Beginner-friendly trail run"},
    ]
    
    if category_filter and category_filter != "All":
        templates = [t for t in templates if t["category"] == category_filter] or templates
    
    events = []
    for i, t in enumerate(templates[:8]):
        days_ahead = (i * 3) + random.randint(1, 5)
        event_date = today.replace(day=min(today.day + days_ahead, 28))
        hour = random.choice([9, 11, 14, 17, 18, 19, 20])
        formatted = event_date.strftime(f"%a %d %b, {hour:02d}:00 {'AM' if hour < 12 else 'PM'}")
        
        cat = t["category"]
        # Generate realistic registration link using insider.in search
        city_slug = city.lower().split(",")[0].strip().replace(" ", "-")
        reg_url = f"https://insider.in/{city_slug}/all"

        events.append({
            "id": f"dynamic-{i}",
            "title": t["title"],
            "category": cat,
            "location": f"{city}",
            "time": formatted,
            "attendees": t["attendees"],
            "image": get_category_image(cat),
            "source": "featured",
            "url": reg_url
        })
    
    return events
