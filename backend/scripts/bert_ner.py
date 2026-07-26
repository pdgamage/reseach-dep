import os
import torch
import joblib
import transformers
import torch.nn as nn

# Model configuration
MAX_LEN = 128
BASE_MODEL_PATH = "bert-base-uncased"
TOKENIZER = transformers.BertTokenizer.from_pretrained(
    BASE_MODEL_PATH,
    do_lower_case=True
)

class EntityModel(nn.Module):
    def __init__(self, num_tag):
        super(EntityModel, self).__init__()
        self.num_tag = num_tag
        config = transformers.BertConfig.from_pretrained(BASE_MODEL_PATH)
        config.return_dict = False
        self.bert = transformers.BertModel(config)
        self.bert_drop_1 = nn.Dropout(0.3)
        self.out_tag = nn.Linear(768, self.num_tag)
    
    def forward(self, ids, mask, token_type_ids, target_tag=None):
        o1, _ = self.bert(ids, attention_mask=mask, token_type_ids=token_type_ids)
        bo_tag = self.bert_drop_1(o1)
        tag = self.out_tag(bo_tag)
        return tag, None


class EntityDataset:
    def __init__(self, texts, tags):
        self.texts = texts
        self.tags = tags
    
    def __len__(self):
        return len(self.texts)
    
    def __getitem__(self, item):
        text = self.texts[item]
        tags = self.tags[item]

        ids = []
        target_tag = []

        for i, s in enumerate(text):
            inputs = TOKENIZER.encode(
                s,
                add_special_tokens=False
            )
            input_len = len(inputs)
            ids.extend(inputs)
            target_tag.extend([tags[i]] * input_len)

        ids = ids[:MAX_LEN - 2]
        target_tag = target_tag[:MAX_LEN - 2]

        ids = [101] + ids + [102]
        target_tag = [-100] + target_tag + [-100]

        mask = [1] * len(ids)
        token_type_ids = [0] * len(ids)

        padding_len = MAX_LEN - len(ids)

        ids = ids + ([0] * padding_len)
        mask = mask + ([0] * padding_len)
        token_type_ids = token_type_ids + ([0] * padding_len)
        target_tag = target_tag + ([-100] * padding_len)

        return {
            "ids": torch.tensor(ids, dtype=torch.long),
            "mask": torch.tensor(mask, dtype=torch.long),
            "token_type_ids": torch.tensor(token_type_ids, dtype=torch.long),
            "target_tag": torch.tensor(target_tag, dtype=torch.long),
        }


class BertNER:
    def __init__(self, model_path, meta_path):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"Initializing BertNER on device: {self.device}")
        
        # Load metadata containing label encoder
        if not os.path.exists(meta_path):
            raise FileNotFoundError(f"Metadata file not found: {meta_path}")
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model weight file not found: {model_path}")

        self.meta_data = joblib.load(meta_path)
        self.enc_tag = self.meta_data["enc_tag"]
        num_tag = len(list(self.enc_tag.classes_))
        
        # Load model and weights
        self.model = EntityModel(num_tag=num_tag)
        self.model.load_state_dict(torch.load(model_path, map_location=self.device))
        self.model.to(self.device)
        self.model.eval()

    def predict(self, sentence):
        sentence_words = sentence.split()
        if not sentence_words:
            return []
            
        test_dataset = EntityDataset(
            texts=[sentence_words], 
            tags=[[0] * len(sentence_words)]
        )

        test_data_loader = torch.utils.data.DataLoader(
            test_dataset, batch_size=1
        )

        with torch.no_grad():
            for data in test_data_loader:
                for k, v in data.items():
                    data[k] = v.to(self.device)
                tag, _ = self.model(**data)
                break
            
            # Get the predicted tag indices
            pred_tags_idx = tag.argmax(2).cpu().numpy().reshape(-1)
            pred_tags = self.enc_tag.inverse_transform(pred_tags_idx)

        current_subword_idx = 1 # Skip [CLS]
        results = []
        
        for word in sentence_words:
            subword_tokens = TOKENIZER.encode(word, add_special_tokens=False)
            num_subwords = len(subword_tokens)
            
            if num_subwords == 0:
                continue
                
            # Take the tag of the first subword token
            if current_subword_idx < len(pred_tags):
                word_tag = pred_tags[current_subword_idx]
            else:
                word_tag = 'O'
            results.append((word, word_tag))
            current_subword_idx += num_subwords
            
        return results

    def extract_entities(self, text):
        raw_predictions = self.predict(text)
        
        # Group BIO tokens into multi-word entities
        entities = {}
        current_entity = []
        current_label = None

        def flush_entity():
            nonlocal current_entity, current_label
            if current_entity and current_label:
                entity_text = " ".join(current_entity)
                
                # Map BERT categories to standard backend categories
                norm_label = current_label
                if norm_label == "COMPANIES_WORKED_AT":
                    norm_label = "COMPANY"
                elif norm_label == "DESIGNATION":
                    norm_label = "ROLE"
                elif norm_label == "COLLEGE_NAME":
                    norm_label = "COLLEGE"
                elif norm_label == "GRADUATION_YEAR":
                    norm_label = "DATE"
                elif norm_label == "EMAIL_ADDRESS":
                    norm_label = "EMAIL"
                elif norm_label == "SKILLS":
                    norm_label = "SKILL"
                
                if norm_label not in entities:
                    entities[norm_label] = []
                entities[norm_label].append(entity_text)
                
                current_entity = []
                current_label = None

        for word, tag in raw_predictions:
            if tag.startswith("B-"):
                flush_entity()
                current_label = tag[2:]
                current_entity.append(word)
            elif tag.startswith("I-") and current_label and tag[2:] == current_label:
                current_entity.append(word)
            else:
                flush_entity()
                
        flush_entity()
        return entities
